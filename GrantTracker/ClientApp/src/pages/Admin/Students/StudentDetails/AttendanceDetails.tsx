import { Link } from 'react-router-dom'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

import { StudentAttendanceView } from 'Models/StudentAttendance'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const attendanceColumns: ColumnDef<StudentAttendanceView, any>[] = [
  {
    accessorKey: "attendanceRecord.session.name",
    header: ({ column }) => (
      <HeaderCell 
        label="Session" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    cell: ({ row }) => (
      <Button variant="link" className="h-auto p-0 text-left justify-start font-normal" asChild>
        <Link 
          to={`/home/admin/sessions/${row.original.attendanceRecord?.session.guid}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
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
      <span>
        {row.original.attendanceRecord.instanceDate.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH))}
      </span>
    ),
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.attendanceRecord.instanceDate
      const dateB = rowB.original.attendanceRecord.instanceDate
      if (dateA.isBefore(dateB)) return -1
      if (dateA.isAfter(dateB)) return 1
      return 0
    },
    id: 'instanceDate'
  },
  {
    accessorKey: "timeRecords",
    header: () => (
      <HeaderCell label="Time Records" />
    ),
    cell: ({ row }) => (
      <div className="py-1">
        <TimeRecordDisplay timeRecords={row.original.timeRecords} />
      </div>
    ),
    enableSorting: false,
    id: 'timeRecords'
  }
]

export default ({ attendance }): JSX.Element => {
  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance records found
      </div>
    )
  }

  return (
    <DataTable
      columns={attendanceColumns}
      data={attendance}
      emptyMessage="No attendance records found"
      initialSorting={[{ id: 'instanceDate', desc: true }]}
      containerClassName="w-full"
    />
  )
}
