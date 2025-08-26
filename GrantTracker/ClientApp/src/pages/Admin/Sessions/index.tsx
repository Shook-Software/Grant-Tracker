import React, { useEffect, useContext } from 'react'
import { Button } from 'components/ui/button'
import { Spinner } from 'components/ui/Spinner'
import { Card, CardHeader, CardContent } from 'components/ui/Card'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LocalDate } from '@js-joda/core'
import { PlusCircle } from 'lucide-react'

import CopyRegistrations from './CopyRegistrations'
import RegisterInstructor from 'pages/Admin/Shared/RegisterInstructor'
import SessionDetails from 'components/SessionDetails'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import { DataTable } from 'components/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from 'components/ui/toggle-group'
import { DayOfWeek, daysOfWeekNumeric } from 'Models/DayOfWeek'
import { SimpleSessionView } from 'Models/Session'
import { DropdownOption } from 'types/Session'
import { OrgYearContext } from 'pages/Admin'

import paths from 'utils/routing/paths'
import api from 'utils/api'
import { IdentityClaim, User } from 'utils/authentication'

// SessionDataTable component definition
const createSessionColumns = (): ColumnDef<SimpleSessionView, any>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <HeaderCell
        label="Name"
        sort={column.getIsSorted()}
        onSortClick={() => column.toggleSorting()}
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    id: 'name'
  },
  {
    accessorKey: "activity.label",
    header: ({ column }) => (
      <HeaderCell label="Activity">
        <Select
          value={column.getFilterValue() as string || "all"}
          onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </HeaderCell>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true
      return row.original.activity.label === value
    },
    id: 'activity.label'
  },
  {
    accessorKey: "sessionType.label",
    header: ({ column }) => (
      <HeaderCell label="Type">
        <Select
          value={column.getFilterValue() as string || "all"}
          onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </HeaderCell>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true
      return row.original.sessionType.label === value
    },
    id: 'sessionType.label'
  },
  {
    accessorKey: 'instructors',
    header: ({ column }) => (
      <HeaderCell
        label="Instructors"
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value)}
      />
    ),
    filterFn: (row, id, value) => row.original.instructors.some(instructor => `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(value.toLowerCase())),
    cell: ({ row }) => (
      <div className='flex flex-col space-y-1'>
        {row.original.instructors.map((instructor, idx) => (
          <div key={idx}>{instructor.firstName} {instructor.lastName}</div>
        ))}
      </div>
    ),
    id: 'instructors'
  },
  {
    header: ({ column }) => {
      return (
        <HeaderCell label="Schedule">
          <ToggleGroup
            className='justify-start'
            type='multiple'
            size='sm'
            value={column.getFilterValue() ?? []}
            onValueChange={(values) => column.setFilterValue(values)}
          >
            {daysOfWeekNumeric.map(dowNum =>
              <ToggleGroupItem key={dowNum} value={DayOfWeek.toString(dowNum)} aria-label={'Filter ' + DayOfWeek.toString(dowNum)}>
                {DayOfWeek.toChar(dowNum)}
              </ToggleGroupItem>
            )}
          </ToggleGroup>
        </HeaderCell>
      )
    },
    filterFn: (row, id, value) => row.original.daySchedules.some(ds => value.includes(ds.dayOfWeek.toString())),
    cell: ({ row }) => (
      row.original.daySchedules.map(day => day.dayOfWeek).sort().map((dayOfWeek, index) =>
        index !== row.original.daySchedules.length - 1
          ? `${DayOfWeek.toChar(dayOfWeek)}, `
          : DayOfWeek.toChar(dayOfWeek)
      )
    ),
    id: 'schedule'
  },
  {
    header: "",
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Button size='sm' asChild>
          <Link to={row.original.sessionGuid}>
            View
          </Link>
        </Button>
      </div>
    ),
    id: 'view',
  },
]

interface SessionDataTableProps {
  data: SimpleSessionView[],
  missingAttendance: AttendanceRecord[] | undefined,
  openSessionGuid: string | undefined,
  activities?: DropdownOption[],
  sessionTypes?: DropdownOption[]
  onRowClick?: (row: SimpleSessionView) => void
}

function SessionDataTable({
  data,
  missingAttendance,
  openSessionGuid,
  activities = [],
  sessionTypes = [],
  onRowClick
}: SessionDataTableProps) {
  const initialColumnFilters = openSessionGuid ? [
    {
      id: 'schedule',
      value: daysOfWeekNumeric.map(dowNum => DayOfWeek.toString(dowNum))
    }
  ] : [];


  const getCustomCellClassName = React.useCallback((cellIndex: number, row: SimpleSessionView) => {
    if (cellIndex === 0) {
      if (openSessionGuid === row.sessionGuid) {
        return "text-blue-600"
      }
      if (missingAttendance?.some(x => x.sessionGuid === row.sessionGuid)) {
        return "text-red-600"
      }
    }
    return ""
  }, [openSessionGuid, missingAttendance])

  const styledColumns = React.useMemo(() => {
    const columnsToUse = openSessionGuid ? [createSessionColumns()[0]] : createSessionColumns()
    console.log(columnsToUse)

    return columnsToUse.map((column, index) => {
      if (column.accessorKey === 'activity.label' && activities.length > 0) {
        return {
          ...column,
          header: ({ column: col }) => (
            <HeaderCell label="Activity">
              <Select
                value={col.getFilterValue() as string || "all"}
                onValueChange={(value) => col.setFilterValue(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {activities.map(activity => (
                    <SelectItem key={activity.guid} value={activity.label}>
                      {activity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </HeaderCell>
          )
        }
      }

      if (column.accessorKey === 'sessionType.label' && sessionTypes.length > 0) {
        return {
          ...column,
          header: ({ column: col }) => (
            <HeaderCell label="Type">
              <Select
                value={col.getFilterValue() as string || "all"}
                onValueChange={(value) => col.setFilterValue(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {sessionTypes.map(type => (
                    <SelectItem key={type.guid} value={type.label}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </HeaderCell>
          )
        }
      }

      return {
        ...column,
        cell: ({ row, ...rest }) => {
          const originalCell = column.cell
          const cellContent = typeof originalCell === 'function'
            ? originalCell({ row, ...rest })
            : row.getValue(column.accessorKey as string)

          const className = getCustomCellClassName(index, row.original)

          return (
            <div className={className}>
              {cellContent}
            </div>
          )
        }
      }
    })
  }, [openSessionGuid, getCustomCellClassName, activities, sessionTypes])

  return (
    <DataTable
      columns={styledColumns}
      containerClassName='w-fit'
      data={data}
      initialColumnFilters={initialColumnFilters}
      emptyMessage="No results."
      onRowClick={onRowClick}
    />
  )
}

export default ({ user }: { user: User }): JSX.Element => {
  document.title = 'GT - Admin / Sessions'
  const navigate = useNavigate()
  const { sessionGuid } = useParams()
  const { orgYear, setOrgYear, sessionsQuery, instructorsQuery } = useContext(OrgYearContext)

  const { isPending: missingLoading, data: missingAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: [`organizationYear/${orgYear?.guid}/Attendance/Missing`],
    enabled: orgYear?.guid !== undefined
  })

  // Fetch dropdown options for filtering
  const { data: dropdownData } = useQuery({
    queryKey: ['dropdown', 'view', 'all'],
    queryFn: () => api.get('/dropdown/view/all').then(res => res.data),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  useEffect(() => {
    if (!!sessionGuid)
      api.get(`/session/${sessionGuid}/orgYear`)
        .then(res => setOrgYear(res.data))
  }, [sessionGuid])

  // Extract activities and sessionTypes from dropdown data
  const activities = dropdownData?.activities || []
  const sessionTypes = dropdownData?.sessionTypes || []

  if (!sessionsQuery || !instructorsQuery || sessionsQuery?.isPending || missingLoading)
    return <Spinner variant='border' />

  return (
    <div>
      <div className='mx-auto px-4 w-full pt-3'>
        {!sessionGuid &&
          <div className='flex mb-3'>
            <div className='flex items-center gap-3 mb-3'>
              <h4 className='m-0 mr-3 text-xl font-semibold'>Sessions</h4>
              <span className='text-background text-sm'>{orgYear?.organization.name}</span>
            </div>

            <div className={user.claim == IdentityClaim.Teacher ? 'hidden' : 'block'}>
              <Button asChild>
                <Link to={`${paths.Edit.path}/${paths.Edit.Sessions.path}/overview?orgYearGuid=${orgYear?.guid}`}>
                  Add Session
                  <PlusCircle />
                </Link>
              </Button>
            </div>
          </div>
        }

        {!sessionsQuery.data || sessionsQuery.data.length === 0 ? (
          <div className='flex items-center justify-center'>
            <p>No sessions found...</p>
          </div>
        ) : (
          <div className='pt-1'>
            <div className='flex flex-nowrap -mx-2'>
              <div className={`px-2 flex-1 w-full`} style={sessionGuid ? { marginLeft: `-250px`, maxWidth: '250px' } : {}}>

                <div className='space-y-6'>
                  <section>
                    <h4 className='text-lg font-medium mb-4'>Active Sessions</h4>
                    <SessionDataTable
                      data={sessionsQuery.data.filter(session =>
                        !session.lastSessionDate.isBefore(LocalDate.now()) &&
                        !session.firstSessionDate.isAfter(LocalDate.now())
                      )}
                      missingAttendance={missingAttendance}
                      openSessionGuid={sessionGuid}
                      activities={activities}
                      sessionTypes={sessionTypes}
                      onRowClick={sessionGuid ? (session) => navigate(`../${session.sessionGuid}`) : undefined}
                    />
                  </section>

                  <section>
                    <h4 className='text-lg font-medium mb-4'>Pending Sessions</h4>
                    <SessionDataTable
                      data={sessionsQuery.data.filter(session =>
                        session.firstSessionDate.isAfter(LocalDate.now())
                      )}
                      missingAttendance={missingAttendance}
                      openSessionGuid={sessionGuid}
                      activities={activities}
                      sessionTypes={sessionTypes}
                      onRowClick={sessionGuid ? (session) => navigate(`../${session.sessionGuid}`) : undefined}
                    />
                  </section>

                  <section>
                    <h4 className='text-lg font-medium mb-4'>Finished Sessions</h4>
                    <SessionDataTable
                      data={sessionsQuery.data.filter(session =>
                        session.lastSessionDate.isBefore(LocalDate.now())
                      )}
                      missingAttendance={missingAttendance}
                      openSessionGuid={sessionGuid}
                      activities={activities}
                      sessionTypes={sessionTypes}
                      onRowClick={sessionGuid ? (session) => navigate(`../${session.sessionGuid}`) : undefined}
                    />
                  </section>
                </div>
              </div>
              <div className={`flex-1 ${!sessionGuid ? 'hidden' : 'md:w-9/12'}`}>
                {sessionGuid && <SessionDetails sessionGuid={sessionGuid} user={user} />}
              </div>
            </div>
          </div>
        )}
      </div>

      <Card className='mt-3 mx-2'>
        <CardHeader className='flex justify-center'>
          <h2 className='text-xl font-medium'>Tools</h2>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <div className='font-medium'>Add Instructor to Sessions</div>
            <RegisterInstructor sessions={sessionsQuery.data || []} instructors={instructorsQuery.data || []} />
          </div>

          <hr className='border-gray-200' />

          <div className='space-y-2'>
            <div className='font-medium'>Copy Registrations:</div>
            <CopyRegistrations state={sessionsQuery.data!} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

