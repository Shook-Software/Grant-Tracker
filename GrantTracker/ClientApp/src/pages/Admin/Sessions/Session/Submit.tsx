import React, {useState} from 'react'

import { Context } from 'pages/Admin/Sessions/SessionEditor'
import { Quarter } from 'Models/OrganizationYear'

import { DateTimeFormatter, LocalTime } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface SubmitProps {
  context: Context
}

export default function Submit (props: SubmitProps): JSX.Element {
  const { values, errors, touched, dropdownData, user } = props.context
  const [showNonActiveYearWarning, setShowNonActiveYearWarning] = useState<boolean>(false)

  const userActiveOrgYear = user.organizationYear
  const currentYear = user.organizationYears
    ?.filter(oy => oy.organization.guid === userActiveOrgYear?.organization.guid)
    ?.find(oy => oy.year.isCurrentYear)

  document.title = `${values.guid ? 'Edit' : 'New'} Session - Submit`

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) return

    if (!values.guid && currentYear && userActiveOrgYear.guid !== currentYear.guid) {
      setShowNonActiveYearWarning(true)
      return
    }

    props.context.handleSubmit()
  }

  const handleCreateInActiveYear = () => {
    setShowNonActiveYearWarning(false)
    if (currentYear && userActiveOrgYear?.organization) {
      const activeOrgYear = user.organizationYears.find(
        oy => oy.organization.guid === userActiveOrgYear.organization.guid && oy.year.isCurrentYear
      )
      if (activeOrgYear) {
        props.context.reducerDispatch({ type: 'setOrgYearGuid', payload: activeOrgYear.guid })
        props.context.handleSubmit()
      }
    }
  }

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='space-y-6'>
        <h2 className='text-2xl font-semibold'>Review and Submit</h2>
        <h3 className='text-lg font-medium'>Session Summary</h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Name</h4>
              <p className='text-lg'>{values.name || 'Not specified'}</p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Type</h4>
              <p className='text-lg'>
                {dropdownData.sessionTypes.find(t => t.guid === values.type)?.label || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Activity</h4>
              <p className='text-lg'>
                {dropdownData.activities.find(a => a.guid === values.activity)?.label || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Objectives</h4>
              <div className='flex flex-wrap gap-2'>
                {values.objectives.map(objGuid => {
                  const obj = dropdownData.objectives.find(o => o.guid === objGuid)
                  return obj ? (
                    <span key={objGuid} className='px-2 py-1 bg-secondary rounded text-sm'>
                      ({obj.abbreviation}) {obj.label}
                    </span>
                  ) : null
                })}
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Grades</h4>
              <div className='flex flex-wrap gap-2'>
                {values.grades.map(gradeGuid => {
                  const grade = dropdownData.grades.find(g => g.guid === gradeGuid)
                  return grade ? (
                    <span key={gradeGuid} className='px-2 py-1 bg-secondary rounded text-sm'>
                      {grade.label}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Partnership Type</h4>
              <p className='text-lg'>
                {dropdownData.partnershipTypes.find(p => p.guid === values.partnershipType)?.label || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Funding Source</h4>
              <p className='text-lg'>
                {dropdownData.fundingSources.find(f => f.guid === values.fundingSource)?.label || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Organization Type</h4>
              <p className='text-lg'>
                {dropdownData.organizationTypes.find(o => o.guid === values.organizationType)?.label || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Instructors</h4>
              <div className='flex flex-wrap gap-2'>
                {values.instructors.map(instructor => (
                  <span key={instructor.guid} className='px-2 py-1 bg-secondary rounded text-sm'>
                    {instructor.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Session Dates</h4>
              <p className='text-lg'>
                {values.firstSessionDate.format(DateTimeFormatter.ofPattern('MMMM d, y').withLocale(Locale.ENGLISH))}
                {' '}-{' '}
                {values.lastSessionDate.format(DateTimeFormatter.ofPattern('MMMM d, y').withLocale(Locale.ENGLISH))}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>Weekly Schedule</h4>
              <div className='space-y-2'>
                {values.scheduling
                  .filter(day => day.timeSchedules.length > 0)
                  .map(day => (
                    <div key={day.dayOfWeek} className='flex gap-4 items-center'>
                      <span className='font-medium min-w-[100px]'>{day.dayOfWeek}</span>
                      <div className='flex flex-wrap gap-2'>
                        {day.timeSchedules.map((time, idx) => (
                          <span key={idx} className='px-2 py-1 bg-secondary rounded text-sm'>
                            {time.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}
                            {' '}-{' '}
                            {time.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {values.blackoutDates.length > 0 && (
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>Blackout Dates</h4>
                <div className='flex flex-wrap gap-2'>
                  {values.blackoutDates.map(blackout => (
                    <span key={blackout.date.toString()} className='px-2 py-1 bg-destructive/10 text-destructive rounded text-sm'>
                      {blackout.date.format(DateTimeFormatter.ofPattern('MMMM d, y').withLocale(Locale.ENGLISH))}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className='p-4 border-2 border-destructive bg-destructive/10 rounded-md'>
            <h4 className='text-base font-semibold text-destructive mb-3'>Please fix the following errors before submitting:</h4>
            <ul className='list-disc list-inside space-y-1 text-sm'>
              {Object.entries(errors).map(([field, error]) => {
                const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
                const errorMessage = typeof error === 'string' ? error : JSON.stringify(error)
                return (
                  <li key={field} className='text-destructive'>
                    <strong>{fieldName}:</strong> {errorMessage}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            onClick={handleSubmit}
            size='lg'
          >
            {values.guid ? 'Update Session' : 'Create Session'}
          </Button>
        </div>
      </div>

      <Dialog open={showNonActiveYearWarning} onOpenChange={(open) => !open && setShowNonActiveYearWarning(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Non-Active Year Warning</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p>
              You are creating a session in <strong>{user.organizationYear?.year ? Quarter[user.organizationYear.year.quarter] : ''} {user.organizationYear?.year?.schoolYear}</strong>, which is not the current active school year for this organization.
            </p>
            <p>
              The current active year is <strong>{currentYear ? Quarter[currentYear.year.quarter] : ''} {currentYear?.year.schoolYear}</strong>.
            </p>
            <p>
              Would you like to create this session in the active year instead, or continue with the selected year?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNonActiveYearWarning(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNonActiveYearWarning(false)
                props.context.handleSubmit()
              }}
            >
              Continue with {user.organizationYear?.year ? Quarter[user.organizationYear.year.quarter] : ''} {user.organizationYear?.year?.schoolYear}
            </Button>
            <Button
              onClick={handleCreateInActiveYear}
            >
              Create in {currentYear ? Quarter[currentYear.year.quarter] : ''} {currentYear?.year.schoolYear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
