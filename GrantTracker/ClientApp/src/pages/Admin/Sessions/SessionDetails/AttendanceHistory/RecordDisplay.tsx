import { useState, useEffect } from 'react'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { ColumnDef } from '@tanstack/react-table'

import { Spinner } from '@/components/ui/Spinner'
import { DataTable } from 'components/DataTable'
import { HeaderCell } from '@/components/ui/table'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

import { AttendanceView, SimpleAttendanceView } from 'Models/StudentAttendance'
import { getAttendanceRecord } from '../api'
import FamilyMemberOps from 'Models/FamilyMember'

const studentColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'studentSchoolYear.student.firstName',
    header: 'First Name',
    enableSorting: true,
    id: 'firstName'
  },
  {
    accessorKey: 'studentSchoolYear.student.lastName', 
    header: 'Last Name',
    enableSorting: true,
    id: 'lastName'
  },
  {
    accessorKey: 'studentSchoolYear.student.matricNumber',
    header: 'Matric #',
    enableSorting: true
  },
  {
    accessorKey: 'studentSchoolYear.grade',
    header: 'Grade',
    cell: ({ row }) => (
      <div className='text-center max-w-[36px]'>{row.original.studentSchoolYear.grade}</div>
    ),
    meta: {
      filter: false
    },
    enableSorting: true
  },
  {
    accessorKey: 'timeRecords',
    header: () => (
      <HeaderCell label="Time Records" />
    ),
    cell: ({ row }) => <TimeRecordDisplay timeRecords={row.original.timeRecords} />,
    enableSorting: false
  }
]

const instructorColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'instructorSchoolYear.instructor.firstName',
    header: 'First Name',
    enableSorting: true,
    id: 'firstName'
  },
  {
    accessorKey: 'instructorSchoolYear.instructor.lastName',
    header: 'Last Name',
    enableSorting: true,
    id: 'lastName'
  },
  {
    accessorKey: 'instructorSchoolYear.instructor.badgeNumber',
    header: 'Badge Number',
    enableSorting: true
  },
  {
    accessorKey: 'timeRecords',
    header: () => (
      <HeaderCell label="Time Records" />
    ),
    cell: ({ row }) => <TimeRecordDisplay timeRecords={row.original.timeRecords} />,
    enableSorting: false
  }
]

function addFamilyColumn (columns: ColumnDef<any>[]): ColumnDef<any>[] {
  return [
    ...columns,
    {
      accessorKey: 'familyAttendance',
      id: 'familyAttendance',
      header: () => (
        <HeaderCell label="Family Attendance">
          <div className='flex flex-col text-xs'>
            <div className='grid grid-cols-2 gap-1 mt-1'>
              <span className='text-center'>Family Member</span>
              <span className='text-center'>Count</span>
            </div>
          </div>
        </HeaderCell>
      ),
      cell: ({ row }) => (
        <div className='flex items-center flex-wrap min-h-full'>
          {row.original.familyAttendance?.map((fa, index) => (
            <div key={index} className='grid grid-cols-2 gap-2 w-full'>
              <span className='text-center'>{FamilyMemberOps.toString(fa.familyMember)}</span>
              <span className='text-center'>{fa.count}</span>
            </div>
          ))}
        </div>
      ),
      enableSorting: false
    }
  ]
}

function removeStudentTimeRecords(columns: ColumnDef<any>[]): ColumnDef<any>[] {
  return columns.filter(x => x.accessorKey !== 'timeRecords')
}


interface Props {
  sessionGuid: string
  sessionName: string
  simpleRecord: SimpleAttendanceView
  sessionType: string
}

export default ({sessionGuid, sessionName, simpleRecord, sessionType}: Props): JSX.Element => {
  const [record, setRecord] = useState<AttendanceView | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function fetchAttendanceRecord(attendanceGuid: string) {
    setIsLoading(true)
    getAttendanceRecord(sessionGuid, attendanceGuid)
      .then(res => setRecord(res))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  let studentTableColumns: ColumnDef<any>[] = [...studentColumns]
  if (record?.studentAttendanceRecords?.length > 0) 
  {
      if (sessionType === 'family' || sessionType === 'parent')
        studentTableColumns = addFamilyColumn(studentTableColumns)

      if (sessionType === 'parent')
        studentTableColumns = removeStudentTimeRecords(studentTableColumns)
  }

  useEffect(() => {
    fetchAttendanceRecord(simpleRecord.guid)
  }, [simpleRecord.guid])

  if (isLoading)
    return (
      <div className='flex justify-center py-4'>
        <Spinner size='lg' />
      </div>
    )

  if (!record)
    return (
      <div 
        className='p-4 border rounded-lg cursor-pointer hover:bg-gray-50'
        onClick={() => !record ? fetchAttendanceRecord(simpleRecord.guid) : null}
      >
        <div className='flex flex-row items-center justify-between'>
          <div className='font-medium'>
            {simpleRecord.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}
          </div>
          <div className='text-sm text-gray-600'>
            <div>{simpleRecord.instructorCount} Instructor Record(s)</div>
            <div>{simpleRecord.studentCount} Student Record(s)</div>
            <div>{simpleRecord.familyCount} Family Record(s)</div>
          </div>
        </div>
      </div>
    )
    
  return (
    <div className='space-y-4'>
      {/* Instructor Records */}
      <div className='space-y-3'>
        <h6 className='text-base font-medium'>Instructor(s)</h6>
        <div className='text-sm'>
          <DataTable 
            columns={instructorColumns} 
            data={record.instructorAttendanceRecords}
            initialSorting={[{
              id: 'firstName',
              desc: false
            }, {
              id: 'lastName',
              desc: false
            }]}
            emptyMessage="No instructor records found"
            containerClassName='w-full'
          />
        </div>
      </div>

      {/* Student Records */}
      <div className='space-y-3'>
        <h6 className='text-base font-medium'>Student(s)</h6>
        <div className='text-sm'>
          <DataTable 
            columns={studentTableColumns} 
            data={record.studentAttendanceRecords}
            initialSorting={[{
              id: 'firstName',
              desc: false
            }, {
              id: 'lastName',
              desc: false
            }]}
            emptyMessage="No student records found"
            containerClassName='w-full'
          />
        </div>
      </div>
    </div>
  )
}