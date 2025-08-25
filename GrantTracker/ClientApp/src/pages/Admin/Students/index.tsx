import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Users, MoreHorizontal } from 'lucide-react'

import StudentDetails from 'components/StudentDetails'
import { OrgYearContext } from '../index'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/Spinner'

import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import { DataTable } from 'components/DataTable'

import api from 'utils/api'
import paths from 'utils/routing/paths'

interface StudentRecord {
  studentSchoolYearGuid: string
  guid: string
  student: {
    firstName: string
    lastName: string
    matricNumber: string
  }
  grade: string
}

const createStudentColumns = (): ColumnDef<StudentRecord, any>[] => [
  {
    accessorKey: "student.firstName",
    header: ({ column }) => (
      <HeaderCell 
        label="First Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    id: 'student.firstName'
  },
  {
    accessorKey: "student.lastName",
    header: ({ column }) => (
      <HeaderCell 
        label="Last Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    id: 'student.lastName'
  },
  {
    accessorKey: "student.matricNumber",
    header: ({ column }) => (
      <HeaderCell 
        label="Matric Number" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.student.matricNumber}
      </div>
    ),
    id: 'matricNumber'
  },
  {
    accessorKey: "grade",
    header: ({ column }) => (
      <HeaderCell 
        label="Grade" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.original.grade}
      </Badge>
    ),
    id: 'grade'
  },
  {
    header: "",
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Button size='sm' asChild>
          <Link to={row.original.guid}>
            View
          </Link>
        </Button>
      </div>
    ),
    id: 'actions',
    enableSorting: false,
    enableColumnFilter: false
  },
]

interface StudentDataTableProps {
  data: StudentRecord[]
  openStudentGuid?: string
  onRowClick?: (row: StudentRecord) => void
}

function StudentDataTable({
  data,
  openStudentGuid,
  onRowClick
}: StudentDataTableProps) {
  const getCustomCellClassName = React.useCallback((cellIndex: number, row: StudentRecord) => {
    if (cellIndex === 0 && openStudentGuid === row.guid) {
      return "text-blue-600"
    }
    return ""
  }, [openStudentGuid])

  // Create combined name column for when a student is selected
  const combinedNameColumn: ColumnDef<StudentRecord, any> = {
    accessorKey: "student.firstName",
    header: ({ column }) => (
      <HeaderCell 
        label="Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.student.firstName} {row.original.student.lastName}
      </div>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true
      const fullName = `${row.original.student.firstName} ${row.original.student.lastName}`.toLowerCase()
      return fullName.includes(value.toLowerCase())
    },
    id: 'fullName'
  }

  const styledColumns = React.useMemo(() => {
    const columnsToUse = openStudentGuid ? [combinedNameColumn] : createStudentColumns()
    
    return columnsToUse.map((column, index) => ({
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
    }))
  }, [openStudentGuid, getCustomCellClassName, combinedNameColumn])

  return (
    <DataTable
      columns={styledColumns}
      data={data}
      emptyMessage="No students found"
      onRowClick={onRowClick}
      initialSorting={[{ id: 'lastName', desc: false }]}
      containerClassName='w-fit'
    />
  )
}

export default (): JSX.Element => {
  document.title = 'GT - Admin / Students'
  const navigate = useNavigate()
  const { studentGuid } = useParams()
  const { orgYear } = useContext(OrgYearContext)
  const [state, setState] = useState<StudentRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function getStudents (): void {
    setIsLoading(true)
    api
      .get('student', { params: {
        name: '',
        organizationGuid: orgYear.organization.guid,
        yearGuid: orgYear.year.guid
      }})
      .then(res => setState(res.data))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    getStudents()
  }, [orgYear])
  
  let rowClick
  if (studentGuid != null) {
    rowClick = (row: StudentRecord) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Students.path}/${row.guid}`)
  }

  return (
    <div>
      <div className='mx-auto px-4 w-full pt-3'>
        {!studentGuid && <div className='flex items-center gap-3 mb-3'>
          <h4 className='m-0 mr-3 text-xl font-semibold'>Students <Users className='inline-block' /></h4>
          <span className='text-background text-sm'>{orgYear?.organization.name}</span>
        </div>}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner variant='border' />
          </div>
        ) : !state || state.length === 0 ? (
          <div className='flex items-center justify-center'>
            <p>No students found...</p>
          </div>
        ) : (
          <div className='pt-1'>
            <div className='flex flex-nowrap -mx-2'>
              <div className={`px-2 flex-1 w-full`} style={studentGuid ? {marginLeft: `-250px`, maxWidth: '250px'} : {}}>
                <div className='space-y-6'>
                  <section>
                    <StudentDataTable 
                      data={state}
                      openStudentGuid={studentGuid}
                      onRowClick={rowClick ? (student) => rowClick(student) : undefined}
                    />
                  </section>
                </div>
              </div>
              <div className={`flex-1 ${!studentGuid ? 'hidden' : 'md:w-9/12'}`}>
                {studentGuid && <StudentDetails studentGuid={studentGuid} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}