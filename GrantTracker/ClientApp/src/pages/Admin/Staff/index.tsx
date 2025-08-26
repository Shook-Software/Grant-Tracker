import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { UserCheck, Search, Plus, Users } from 'lucide-react'

import AddInstructorsModal from 'components/Modals/AddInstructorModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

import { DropdownOption } from 'types/Session'
import { addInstructor, fetchGrantTrackerInstructors } from './api'
import { ApiResult } from 'components/ApiResultAlert'

import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import { DataTable } from 'components/DataTable'

import InstructorPage from 'components/Displays/Instructor'
import paths from 'utils/routing/paths'
import { OrgYearContext } from '..'


interface InstructorRecord {
  guid: string
  instructor: {
    firstName: string
    lastName: string
    badgeNumber: string
  }
  status: DropdownOption
}

const createInstructorColumns = (): ColumnDef<InstructorRecord, any>[] => [
  {
    accessorKey: "instructor.firstName",
    header: ({ column }) => (
      <HeaderCell
        label="First Name"
        sort={column.getIsSorted()}
        onSortClick={() => column.toggleSorting()}
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    id: 'instructor.firstName'
  },
  {
    accessorKey: "instructor.lastName",
    header: ({ column }) => (
      <HeaderCell
        label="Last Name"
        sort={column.getIsSorted()}
        onSortClick={() => column.toggleSorting()}
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    id: 'instructor.lastName'
  },
  {
    accessorKey: "instructor.badgeNumber",
    header: ({ column }) => (
      <HeaderCell
        label="Badge Number"
        sort={column.getIsSorted()}
        onSortClick={() => column.toggleSorting()}
        filterValue={column.getFilterValue() as string}
        onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.instructor.badgeNumber}
      </div>
    ),
    id: 'badgeNumber'
  },
  {
    accessorKey: "status.label",
    header: ({ column }) => (
      <HeaderCell
        label="Status"
        sort={column.getIsSorted()}
        onSortClick={() => column.toggleSorting()}
      />
    ),
    cell: ({ row }) => (
      <Badge
        variant={row.original.status.label === 'Active' ? 'default' : 'secondary'}
        className="font-medium"
      >
        {row.original.status.label}
      </Badge>
    ),
    id: 'status'
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

interface InstructorDataTableProps {
  data: InstructorRecord[]
  openInstructorGuid?: string
  onRowClick?: (row: InstructorRecord) => void
}

function InstructorDataTable({
  data,
  openInstructorGuid,
  onRowClick
}: InstructorDataTableProps) {
  const getCustomCellClassName = React.useCallback((cellIndex: number, row: InstructorRecord) => {
    if (cellIndex === 0 && openInstructorGuid === row.guid) {
      return "text-blue-600 font-medium"
    }
    return ""
  }, [openInstructorGuid])

  // Create combined name column for when an instructor is selected
  const combinedNameColumn: ColumnDef<InstructorRecord, any> = {
    accessorKey: "instructor.firstName",
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
        {row.original.instructor.firstName} {row.original.instructor.lastName}
      </div>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true
      const fullName = `${row.original.instructor.firstName} ${row.original.instructor.lastName}`.toLowerCase()
      return fullName.includes(value.toLowerCase())
    },
    id: 'fullName'
  }

  const styledColumns = React.useMemo(() => {
    const columnsToUse = openInstructorGuid ? [combinedNameColumn] : createInstructorColumns()

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
  }, [openInstructorGuid, getCustomCellClassName, combinedNameColumn])

  return (
    <DataTable
      columns={styledColumns}
      containerClassName='w-fit'
      data={data}
      emptyMessage="No instructors found"
      onRowClick={onRowClick}
      initialSorting={[{ id: 'lastName', desc: false }]}
    />
  )
}

export default (): JSX.Element => {
  document.title = 'GT - Admin / Staff'
  const { instructorSchoolYearGuid } = useParams()
  const { orgYear, instructorsQuery } = useContext(OrgYearContext)
  const [showModal, setShowModal] = useState<boolean>(false)
  const navigate = useNavigate()

  function addInternalInstructor(instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      addInstructor(orgYear.guid, instructor)
        .then(res => {
          instructorsQuery?.refetch();
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: true
          })
        })
        .catch(err => {
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: false
          })
        })
    })
  }

  function addExternalInstructor(instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      addInstructor(orgYear?.guid, instructor)
        .then(res => {
          instructorsQuery?.refetch();
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: true
          })
        })
        .catch(err => {
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: false
          })
        })
    })
  }

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    instructorsQuery?.refetch()
  }, [orgYear])

  let rowClick = null
  if (instructorSchoolYearGuid) {
    rowClick = (row: InstructorRecord) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}/${row.guid}`)
  }

  return (
    <div>
      <AddInstructorsModal
        show={showModal}
        orgYearGuid={orgYear?.guid}
        handleClose={handleCloseModal}
        onInternalChange={addInternalInstructor}
        onExternalChange={addExternalInstructor}
      />

      <div className='mx-auto px-4 w-full pt-3'>
        {!instructorSchoolYearGuid && 
          <div className='flex items-center gap-3 mb-3'>
            <h4 className='m-0 mr-3 text-xl font-semibold'>Instructors <Users className='inline-block' /></h4>
            <span className='text-background text-sm'>{orgYear?.organization.name}</span>
            <Button onClick={handleOpenModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Instructor
            </Button>
          </div>
        }

        {!instructorsQuery || instructorsQuery.isPending ? (
          <div className="flex justify-center py-8">
            <Spinner variant='border' />
          </div>
        ) : !instructorsQuery.isFetched && instructorsQuery.data!.length === 0 ? (
          <div className='flex items-center justify-center'>
            <p>No instructors found...</p>
          </div>
        ) : (
          <div className='pt-1'>
            <div className='flex flex-nowrap -mx-2'>
              <div className={`px-2 flex-1 w-full`} style={instructorSchoolYearGuid ? { marginLeft: `-250px`, maxWidth: '250px' } : {}}>
                <div className='space-y-6'>
                  <section>
                    <InstructorDataTable
                      data={instructorsQuery.data || []}
                      openInstructorGuid={instructorSchoolYearGuid}
                      onRowClick={rowClick ? (instructor) => rowClick(instructor) : undefined}
                    />
                  </section>
                </div>
              </div>
              <div className={`flex-1 ${!instructorSchoolYearGuid ? 'hidden' : 'md:w-9/12'}`}>
                {instructorSchoolYearGuid && <InstructorPage instructorSchoolYearGuid={instructorSchoolYearGuid} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}