import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { User, Shield, CalendarDays, BookOpen, Clock, Edit3, Save, X, Trash2, School } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/Spinner'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ComboboxDropdownMenu, ComboboxDropdownMenuItem, ComboboxDropdownMenuItemClassName } from 'components/Dropdown'
import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'

import EnrollmentDisplay from './Enrollment'
import AttendanceDetails from './AttendanceDetails'

import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'
import { Quarter } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'

import { getInstructorStatusOptions, getInstructor, patchInstructorStatus, markForDeletion as markInstructorForDeletion } from './api'
import paths from 'utils/routing/paths'
import { OrgYearContext } from 'pages/Admin'

interface OrganizationHistoryRecord {
  organizationYearGuid: string
  name: string
  schoolYear: string
  quarter: string
}

const organizationHistoryColumns: ColumnDef<OrganizationHistoryRecord, any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <HeaderCell 
        label="Organization" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'name'
  },
  {
    accessorKey: "schoolYear",
    header: ({ column }) => (
      <HeaderCell 
        label="School Year" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'schoolYear'
  },
  {
    accessorKey: "quarter",
    header: ({ column }) => (
      <HeaderCell 
        label="Quarter" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {row.original.quarter}
      </Badge>
    ),
    id: 'quarter'
  }
]

const flattenOrganizationHistory = (organizations: any): OrganizationHistoryRecord[] => {
  let flattenedHistory: OrganizationHistoryRecord[] = []

  organizations.forEach(org => {
    org.organizationYears.forEach(oy => {
      flattenedHistory = [...flattenedHistory, {
        organizationYearGuid: oy.guid,
        name: org.name,
        schoolYear: oy.year.schoolYear,
        quarter: Quarter[oy.year.quarter]
      }]
    })
  })
  return flattenedHistory
}

interface BasicDetailsProps {
  instructor: InstructorSchoolYearView
  onChange: (instructor: InstructorSchoolYearView) => void
  pendingDeletion: boolean
  editing: boolean
}

const BasicDetails = ({instructor: instructorSchoolYear, onChange, pendingDeletion, editing}: BasicDetailsProps): JSX.Element => {
  const instructor: InstructorView = instructorSchoolYear.instructor
  const [status, setStatus] = useState(instructorSchoolYear.status.guid)
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    getInstructorStatusOptions()
      .then(res => setOptions(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <div>
      <div className="flex justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="h-4 w-4" />
            Badge Number
          </div>
          <div className="font-mono text-lg p-3 bg-muted/30 rounded-md">
            {instructor.badgeNumber}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <School className="h-4 w-4" />
            Job Title
          </div>
          <div className="p-3">
            <Badge variant="secondary">
              {instructorSchoolYear.title}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            Reporting Status
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            {editing ? (
              <Select 
                value={status} 
                onValueChange={(value) => {
                  setStatus(value)
                  onChange({...instructorSchoolYear, status: dropdownOptions.find(o => o.guid === value)!})
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.map(option => (
                    <SelectItem key={option.guid} value={option.guid}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={instructorSchoolYear.status.label === 'Active' ? 'default' : 'secondary'}>
                {instructorSchoolYear.status.label}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Site Status
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            {editing ? (
              <Button
                variant={instructorSchoolYear.isPendingDeletion ? "outline" : "destructive"}
                size="sm"
                onClick={() => onChange({...instructorSchoolYear, isPendingDeletion: !instructorSchoolYear.isPendingDeletion})}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {instructorSchoolYear.isPendingDeletion ? 'Undo Deletion Request' : 'Request Deletion'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pendingDeletion ? 'bg-destructive' : 'bg-green-500'}`}></div>
                <span className={pendingDeletion ? 'text-destructive' : 'text-green-600'}>
                  {pendingDeletion ? 'Pending Deletion - An administrator will review your request.' : 'Active'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ({instructorSchoolYearGuid}): JSX.Element => {
  const { orgYear } = useContext(OrgYearContext)
  const [instructorSchoolYear, setInstructorSchoolYear] = useState<InstructorSchoolYearView | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [persistedDeletionRequested, setPersistedDeletionRequested] = useState<boolean>(false)

  function fetchInstructor(instructorSchoolYearGuid): void {
    setIsLoading(true)
    setInstructorSchoolYear(null)

    getInstructor(instructorSchoolYearGuid)
      .then(res => {
        setPersistedDeletionRequested(res.isPendingDeletion)
        setInstructorSchoolYear(res)
      })
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  function handleInstructorChange(instructor: InstructorSchoolYearView): void {
    setInstructorSchoolYear(instructor)
  }

  function markForDeletion() {
    if (!instructorSchoolYear || persistedDeletionRequested == instructorSchoolYear.isPendingDeletion)
      return;

    return markInstructorForDeletion(instructorSchoolYearGuid);
  }

  async function saveChangesAsync() {
    if (!instructorSchoolYear)
      return;

    await Promise.all([patchInstructorStatus(instructorSchoolYear), markForDeletion()])
      .then(res => fetchInstructor(instructorSchoolYearGuid))
      .finally(() => {
        setEditing(false)
      });
  }

  function cancelEdit() {
    setEditing(false)
    fetchInstructor(instructorSchoolYearGuid)
  }

  useEffect(() => {
    fetchInstructor(instructorSchoolYearGuid)
  }, [instructorSchoolYearGuid])
  
  if (isLoading) 
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spinner variant="border" />
        <div className="text-sm text-muted-foreground mt-2">Loading Instructor...</div>
      </div>
    )
  else if (!instructorSchoolYear) 
    return (
      <div className='flex justify-center py-8'>
        <p className='text-destructive'>An error occurred while loading the instructor.</p>
      </div>
    )

  const organizationHistoryFlattened = flattenOrganizationHistory(instructorSchoolYear.organizations)
  const instructor: InstructorView = instructorSchoolYear.instructor

  return (
    <div>
      {/* Header with Actions Menu */}
      <header className="space-y-4 mb-6">
        <div className='flex justify-center items-center gap-4'>
          <div className="text-center">
            <h1 className='text-3xl font-bold'>
              {instructor.firstName} {instructor.lastName}
            </h1>
            <div className="text-muted-foreground space-y-1">
              <div className="font-small flex gap-3">
                <span>{instructorSchoolYear.organizationName}</span>
                <span>{instructorSchoolYear.year.schoolYear} - {Quarter[instructorSchoolYear.year.quarter]}</span>
              </div>
            </div>
          </div>

          <ComboboxDropdownMenu aria-label="Instructor actions menu">
            <div className={ComboboxDropdownMenuItemClassName}>
              <Link 
                className='block w-full' 
                to={`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}`}
                aria-label="Close instructor details and return to staff list"
              >
                Close
              </Link>
            </div>

            {editing ? (
              <>
                <ComboboxDropdownMenuItem 
                  variant='default'
                  label='Save Changes'
                  onClick={saveChangesAsync}
                  icon={Save}
                />
                <ComboboxDropdownMenuItem 
                  variant='secondary'
                  label='Cancel'
                  onClick={cancelEdit}
                  icon={X}
                />
              </>
            ) : (
              <ComboboxDropdownMenuItem 
                variant='default'
                label='Edit'
                onClick={() => setEditing(true)}
                icon={Edit3}
              />
            )}
          </ComboboxDropdownMenu>
        </div>
      </header>

      <div>
        <section>
          <BasicDetails 
            instructor={instructorSchoolYear} 
            onChange={handleInstructorChange} 
            pendingDeletion={persistedDeletionRequested} 
            editing={editing}
          />
        </section>

        <hr className="my-6" />

        {/* Organization History */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Organization History
          </h2>
          <DataTable
            columns={organizationHistoryColumns}
            data={organizationHistoryFlattened}
            emptyMessage="No organization history found"
            containerClassName="w-full"
          />
        </section>

        <hr className="my-6" />

        {/* Session Enrollment */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Session Enrollment
          </h2>
          <EnrollmentDisplay enrollments={instructorSchoolYear.enrollmentRecords} />
        </section>

        <hr className="my-6" />

        {/* Session Attendance */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Attendance
          </h2>
          <AttendanceDetails attendance={instructorSchoolYear.attendanceRecords} />
        </section>
      </div>
    </div>
  )
}