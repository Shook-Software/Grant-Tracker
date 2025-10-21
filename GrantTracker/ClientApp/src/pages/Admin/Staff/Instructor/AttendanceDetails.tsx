import { Link } from 'react-router-dom'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { ExternalLink } from 'lucide-react'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

import { AttendanceTimeRecordView, AttendanceView } from 'Models/StudentAttendance'
import { InstructorAttendance } from 'Models/InstructorAttendance'

interface AttendanceRecord {
  attendanceRecord: AttendanceView
  timeRecords: AttendanceTimeRecordView[]
}

const attendanceColumns: ColumnDef<AttendanceRecord, any>[] = [
  {
    accessorKey: "attendanceRecord.session.name",
    header: ({ column }) => (
      <HeaderCell 
        label="Session" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <Button variant="link" className="h-auto p-0 text-left justify-start font-normal" asChild>
        <Link 
          to={`/home/admin/sessions/${row.original.attendanceRecord?.session.guid}`}
          className="flex items-center gap-1"
        >
          {row.original.attendanceRecord?.session.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </Button>
    ),
    id: 'sessionName'
  },
  {
    accessorKey: "attendanceRecord.instanceDate",
    header: ({ column }) => (
      <HeaderCell 
        label="Date" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.attendanceRecord.instanceDate.format(
          DateTimeFormatter.ofPattern('MM/dd/yyyy').withLocale(Locale.ENGLISH)
        )}
      </div>
    ),
    sortingFn: (a, b) => {
      const dateA = a.original.attendanceRecord.instanceDate
      const dateB = b.original.attendanceRecord.instanceDate
      if (dateA.isBefore(dateB)) return -1
      if (dateA.isAfter(dateB)) return 1
      return 0
    },
    id: 'instanceDate'
  },
  {
    accessorKey: "timeRecords",
    header: ({ column }) => (
      <HeaderCell 
        label="Time Records" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    cell: ({ row }) => (
      <TimeRecordDisplay timeRecords={row.original.timeRecords} />
    ),
    enableSorting: false,
    enableColumnFilter: false,
    id: 'timeRecords'
  }
]

export default ({ attendance }): JSX.Element => {
  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">No attendance records found</div>
      </div>
    )
  }

  const processedAttendance: AttendanceRecord[] = attendance
    .map(a => InstructorAttendance.toViewModel(a))
    .sort((first, second) => {
      if (first.attendanceRecord.instanceDate.isEqual(second.attendanceRecord.instanceDate)) {
        return first.timeRecords[0]?.startTime?.isBefore(second.timeRecords[0]?.startTime) ? -1 : 1
      }
      return first.attendanceRecord.instanceDate.isBefore(second.attendanceRecord.instanceDate) ? 1 : -1
    })

  return (
    <DataTable
      columns={attendanceColumns}
      data={processedAttendance}
      emptyMessage="No attendance records found"
      initialSorting={[{ id: 'instanceDate', desc: true }]}
      containerClassName="w-full"
    />
  )
}