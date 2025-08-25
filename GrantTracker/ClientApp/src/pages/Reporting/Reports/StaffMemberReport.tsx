import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Quarter } from 'Models/OrganizationYear'
import { Button } from '@/components/ui/button'

interface StaffMemberData {
	organizationName: string
	schoolYear: string
	quarter: number
	badgeNumber: string
	status: string
	lastName: string
	firstName: string
}

interface Props {
	isActive: boolean
}

export default ({isActive}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/all-staff` ],
		retry: false,
		staleTime: Infinity
	  })
	
	const organizationOptions = useMemo(() => [...new Set(report?.map(r => r.organizationName).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const schoolYearOptions = useMemo(() => [...new Set(report?.map(r => r.schoolYear).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const quarterOptions = useMemo(() => [...new Set(report?.map(r => r.quarter).filter(q => q !== undefined))].map(q => ({ value: q.toString(), label: Quarter[q] })), [report])
	const statusOptions = useMemo(() => [...new Set(report?.map(r => r.status).filter(Boolean))].map(v => ({ value: v, label: v })), [report])

	const staffMemberColumns = useMemo<ColumnDef<StaffMemberData, any>[]>(() => [
		{
			accessorKey: "organizationName",
			header: ({ column }) => (
				<HeaderCell 
					label="Organization" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={organizationOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'organizationName'
		},
		{
			accessorKey: "schoolYear",
			header: ({ column }) => (
				<HeaderCell 
					label="School Year" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={schoolYearOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'schoolYear'
		},
		{
			accessorKey: "quarter",
			header: ({ column }) => (
				<HeaderCell 
					label="Quarter" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={quarterOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id).toString() === value
			},
			cell: ({ row }) => {
				const quarter = row.getValue("quarter") as number
				return Quarter[quarter]
			},
			id: 'quarter'
		},
		{
			accessorKey: "badgeNumber",
			header: ({ column }) => (
				<HeaderCell 
					label="ID" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search IDs..."
				/>
			),
			filterFn: (row, id, value) => {
				const badgeNumber = row.getValue(id) as string
				return badgeNumber?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'badgeNumber'
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<HeaderCell 
					label="Status" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={statusOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'status'
		},
		{
			accessorKey: "lastName",
			header: ({ column }) => (
				<HeaderCell 
					label="Last Name" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search last names..."
				/>
			),
			filterFn: (row, id, value) => {
				const lastName = row.getValue(id) as string
				return lastName?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'lastName'
		},
		{
			accessorKey: "firstName",
			header: ({ column }) => (
				<HeaderCell 
					label="First Name" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search first names..."
				/>
			),
			filterFn: (row, id, value) => {
				const firstName = row.getValue(id) as string
				return firstName?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'firstName'
		}
	], [organizationOptions, schoolYearOptions, quarterOptions, statusOptions])

	if (!isActive)
		return null;

	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={staffMemberColumns}
					data={report || []}
					initialSorting={[{ id: 'organizationName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={'All Staff, All Years'}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(values.map(row => ({...row, quarter: Quarter[row.quarter]})), fields, 'All_Staff')}
								size='sm'
							>
								Save to CSV {values && values.length !== (report.length) ? `(${values.length} filtered rows)` : ''}
							</Button>
						)
					}}
				/>
			</div>
		</ReportComponent>
	)
}


const fields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'SchoolYear',
		value: 'schoolYear'
	},
	{
		label: 'Quarter',
		value: 'quarter'
	},
	{
		label: 'ID',
		value: 'badgeNumber'
	},
	{
		label: 'Status',
		value: 'status'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
]