import { Clock } from 'lucide-react'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'

import { DaySchedule, DayScheduleDomain, DayScheduleView } from 'Models/DaySchedule'
import { DayOfWeek } from 'Models/DayOfWeek'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

interface EnrollmentRecord {
  key: any
  sessionName: string
  schedule: DayScheduleDomain[]
}

const enrollmentColumns: ColumnDef<EnrollmentRecord, any>[] = [
  {
    accessorKey: "sessionName",
    header: ({ column }) => (
      <HeaderCell 
        label="Session Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.sessionName}
      </div>
    ),
    id: 'sessionName'
  },
  {
    accessorKey: "schedule",
    header: () => (
      <div className="flex items-center gap-2 h-full">
        <Clock className="h-4 w-4" />
        Schedule
      </div>
    ),
    cell: ({ row }) => {
      const scheduleDomain = row.original.schedule
      
      if (!scheduleDomain || scheduleDomain.length === 0) {
        return (
          <div className="text-muted-foreground text-sm italic">
            No schedule configured
          </div>
        )
      }

      const schedule: DayScheduleView[] = scheduleDomain.map(s => DaySchedule.toViewModel(s))
      const sortedDays = schedule.sort((curr, next) => DayOfWeek.toInt(curr.dayOfWeek) - DayOfWeek.toInt(next.dayOfWeek))

      return (
        <div className="space-y-2">
          {sortedDays.map((day, index) => (
            <div key={index} className="flex gap-3">
              <div className="text-sm font-medium text-muted-foreground w-[80px]">
                {day.dayOfWeek}
              </div>
              <div className="flex flex-wrap gap-1">
                {day.timeSchedules.map((timeSchedule, timeIndex) => (
                  <TimeRecordDisplay timeRecords={[timeSchedule]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    enableSorting: false,
    id: 'schedule'
  }
]

interface Props {
  enrollments: EnrollmentRecord[]
}

export default ({enrollments}: Props): JSX.Element => {
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">No session enrollments found</div>
      </div>
    )
  }

  return (
    <DataTable
      columns={enrollmentColumns}
      data={enrollments}
      emptyMessage="No session enrollments found"
      initialSorting={[{ id: 'sessionName', desc: false }]}
      containerClassName="w-full"
    />
  )
}