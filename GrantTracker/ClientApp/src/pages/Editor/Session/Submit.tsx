import { useState, useEffect } from 'react'
import { convert, DateTimeFormatter, LocalTime } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import ListItem from 'components/Item'
import { GradeView } from 'Models/Grade'
import { WeeklySchedule } from 'Models/DaySchedule'
import { DropdownOption } from 'types/Session'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/Alert'
import { Clock, Calendar, AlertTriangle, AlertCircle } from 'lucide-react'

import { useSession, Context } from '../index'
import api from 'utils/api'

function timesMoreThanTwoHoursApart(timeSchedules: any[]): boolean {
  return timeSchedules.some((current, idx) => {
    if (idx == 0)
      return false;

    const previous = timeSchedules[idx - 1];
    return previous.endTime.plusHours(2).isBefore(current.startTime);
  })
}

function sessionDurationHours(timeSchedules: any[]): number {
  let largestInterval: number = 0;

  timeSchedules?.forEach(ts => {
    const interval = ts.endTime.hour() - ts.startTime.hour()
    if (interval > largestInterval)
      largestInterval = interval
  })

  return largestInterval
}

function formatScheduling (scheduling: WeeklySchedule, errors): JSX.Element {
  const activeDays = scheduling.filter(weekday => weekday.recurs);
  
  if (activeDays.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>No schedule configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activeDays.map((weekday, index) => {
        const hasTimeErrors = weekday.timeSchedules.some(schedule => schedule.startTime.equals(schedule.endTime))
        const hasGapWarning = timesMoreThanTwoHoursApart(weekday.timeSchedules)
        const durationHours = sessionDurationHours(weekday.timeSchedules)
        const hasDurationWarning = durationHours >= 4
        
        return (
          <Card key={weekday.dayOfWeek} className={`${hasTimeErrors ? 'border-destructive' : 'border-border/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {weekday.dayOfWeek}
                {hasTimeErrors && <AlertCircle className="h-4 w-4 text-destructive" />}
                {(hasGapWarning || hasDurationWarning) && <AlertTriangle className="h-4 w-4 text-warning" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-2">
                {weekday.timeSchedules.map((schedule, scheduleIndex) => {
                  const isInvalid = schedule.startTime.equals(schedule.endTime)
                  return (
                    <Badge 
                      key={scheduleIndex}
                      variant={isInvalid ? "destructive" : "secondary"}
                      className={`px-3 py-1 text-sm flex items-center gap-1 ${isInvalid ? '' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                      <Clock className="h-3 w-3" />
                      {schedule.startTime.format(
                        DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)
                      )}
                      {' → '}
                      {schedule.endTime.format(
                        DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)
                      )}
                    </Badge>
                  )
                })}
              </div>
              
              {/* Error Messages */}
              {hasTimeErrors && errors.timeSchedules && (
                <Alert variant="danger">
                  <AlertCircle className="h-4 w-4" />
                  <div className="text-sm">
                    {errors.timeSchedules}
                  </div>
                </Alert>
              )}
              
              {/* Warnings */}
              {hasGapWarning && (
                <Alert className="border-warning/50 text-warning">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div className="text-sm text-warning">
                    Consider creating two sessions - times are more than two hours apart
                  </div>
                </Alert>
              )}
              
              {hasDurationWarning && (
                <Alert className="border-warning/50 text-warning">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div className="text-sm text-warning">
                    Long session duration: <span className="font-semibold">{durationHours} hours</span>. Please verify this is correct.
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function sessionHasValidationIssues(errors: any, values): boolean {
  return Object.values(errors).some(error => error !== null && error !== undefined && error !== '')
}

//Create component to replace Item & inner HTML if a refactor is ever needed
interface SDisplayProps extends Context {
  grades: GradeView[]
}

//we can use errors to display errors as needed and desired, then add a subscript to ListItem if desired
const SessionDisplay = ({
  reducerDispatch,
  dropdownData,
  values,
  errors,
  grades
}: SDisplayProps): JSX.Element => {
  const hasErrors = errors.name || errors.objectives
  
  return (
    <Card className={`${hasErrors ? 'border-destructive' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Session Details
          {hasErrors && <AlertCircle className="h-5 w-5 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className={`p-3 rounded-md text-sm ${
              errors.name 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'bg-muted/30'
            }`}>
              {values.name || 'No name provided'}
            </div>
            {errors.name && (
              <Alert variant="danger">
                <AlertCircle className="h-4 w-4" />
                <div>{errors.name}</div>
              </Alert>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="p-3 bg-muted/30 rounded-md text-sm">
                {dropdownData.sessionTypes.find(e => e.guid === values.type)?.label || 'Not selected'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Activity</div>
              <div className="p-3 bg-muted/30 rounded-md text-sm">
                {dropdownData.activities.find(e => e.guid === values.activity)?.label || 'Not selected'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Objectives</div>
            <div className={`p-3 rounded-md text-sm space-y-1 ${
              errors.objectives 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'bg-muted/30'
            }`}>
              {values.objectives.length > 0 ? (
                values.objectives.map(objGuid => {
                  const objective = dropdownData.objectives.find(e => e.guid === objGuid)
                  return (
                    <Badge key={objGuid} variant="outline" className="mr-1 mb-1">
                      {objective?.abbreviation && `(${objective.abbreviation}) `}{objective?.label}
                    </Badge>
                  )
                })
              ) : (
                <span className="text-muted-foreground">No objectives selected</span>
              )}
            </div>
            {errors.objectives && (
              <Alert variant="danger">
                <AlertCircle className="h-4 w-4" />
                <div>{errors.objectives}</div>
              </Alert>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Grade Levels</div>
            <div className="p-3 bg-muted/30 rounded-md text-sm">
              {grades?.length !== 0
                ? grades.map((grade, index) => (
                    <Badge key={grade.value} variant="secondary" className="mr-1 mb-1">
                      {grade.value}
                    </Badge>
                  ))
                : <span>All Grade Levels</span>
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SchedulingDisplay = ({
  reducerDispatch,
  dropdownData,
  values,
  errors
}: Context): JSX.Element => {
  
    const schedule = values.recurring
      ? values.scheduling
      : values.scheduling.find(s => s.timeSchedules.length !== 0)

  return (
    <Card className={`${errors.scheduling ? 'border-destructive' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduling
          {errors.scheduling && <AlertCircle className="h-5 w-5 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {values.recurring ? 'Series Start Date' : 'Session Date'}
            </div>
            <div className="p-3 bg-muted/30 rounded-md text-sm">
              {convert(values.firstSessionDate)
                .toDate()
                .toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </div>
          </div>
          
          {values.recurring && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Last Session Date
              </div>
              <div className="p-3 bg-muted/30 rounded-md text-sm">
                {convert(values.lastSessionDate)
                  .toDate()
                  .toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            {values.recurring ? 'Weekly Schedule' : 'Time Schedule'}
          </div>
          {formatScheduling(schedule, errors)}
        </div>
        
        {errors.scheduling && (
          <Alert variant="danger">
            <AlertCircle className="h-4 w-4" />
            <div>{errors.scheduling}</div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

const OrganizerDisplay = ({
  reducerDispatch,
  dropdownData,
  values,
  errors
}: Context): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Organizer Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Funding Source</div>
          <div className="p-3 bg-muted/30 rounded-md text-sm">
            {dropdownData.fundingSources.find(e => e.guid === values.fundingSource)?.label || 'Not selected'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Organization Type</div>
          <div className="p-3 bg-muted/30 rounded-md text-sm">
            {dropdownData.organizationTypes.find(e => e.guid === values.organizationType)?.label || 'Not selected'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Partnership Type</div>
          <div className="p-3 bg-muted/30 rounded-md text-sm">
            {dropdownData.partnershipTypes.find(e => e.guid === values.partnershipType)?.label || 'Not selected'}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const InstructorDisplay = ({
  reducerDispatch,
  dropdownData,
  values,
  errors
}: Context): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        Instructors
        <Badge variant="secondary">{values.instructors.length}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {values.instructors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mx-auto h-8 w-8 mb-2 opacity-50">
            👤
          </div>
          <p>No instructors selected</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {values.instructors.map(instructor => (
            <div key={instructor.guid} className='p-3 bg-muted/30 rounded-md text-sm font-medium'>
              {instructor.label}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

//Don't allow '#' in session names, and other special characters probably
export default (): JSX.Element => {
  const props: Context = useSession()
  const [grades, setGrades] = useState<GradeView[]>([])

  if (!props.values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  document.title = `${props.values.guid ? 'Edit' : 'New'} Session - Submit`


  useEffect(() => {
    props.forceValidation();

    api
      .get<DropdownOption[]>('dropdown/view/grades')
      .then(res => {
        //console.log(res.data)
        let gradeViews: GradeView[] = res.data
          .filter(option => props.values.grades.includes(option.guid))
          .map(
            grade =>
              ({
                value: grade.abbreviation,
                description: grade.label
              } as GradeView)
          )

        setGrades(gradeViews)
      })
      .catch(err => {
        console.warn(err)
      })
  }, [])

  const hasValidationIssues = sessionHasValidationIssues(props.errors, props.values)
  
  //on click, take user to appropriate page and focus the appropriate element
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Validation Summary */}
      {hasValidationIssues && (
        <Alert variant="danger" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <div>
            <div className="font-medium mb-1">Please fix the following issues before submitting:</div>
            <ul className="text-sm space-y-1 ml-4">
              {Object.entries(props.errors).map(([key, error]) => 
                error && <li key={key}>• {typeof error === 'string' ? error : 'Please check this field'}</li>
              )}
            </ul>
          </div>
        </Alert>
      )}
      
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <div className="space-y-6">
          <SessionDisplay {...props} grades={grades} />
          <OrganizerDisplay {...props} />
        </div>
        <div className="space-y-6">
          <SchedulingDisplay {...props} />
          <InstructorDisplay {...props} />
        </div>
      </div>
      
      <div className='flex justify-center pt-6'>
        <Button 
          type='submit' 
          disabled={hasValidationIssues}
          size="lg"
          className="px-8 py-3"
        >
          {hasValidationIssues ? 'Fix Issues to Submit' : 'Submit Session'}
        </Button>
      </div>
    </div>
  )
}
