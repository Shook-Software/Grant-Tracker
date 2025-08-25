import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useMemo } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { staffingFields, flattenStaffing } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Button } from '@/components/ui/button'

interface StaffMember {
	firstName: string
	lastName: string
	instructorSchoolYearGuid: string
	status: string // Added status to flattened data
}

interface StatusGroup {
	status: string
	instructors: Omit<StaffMember, 'status'>[]
}

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	isActive: boolean
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, isActive, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/staffSummary?yearGuid=${params?.year?.guid}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params?.year?.guid
	  })

	// Flatten the grouped data structure
	const flattenedStaffData = useMemo<StaffMember[]>(() => {
		if (!Array.isArray(report)) return []
		
		return report.flatMap((statusGroup: StatusGroup) =>
			statusGroup.instructors.map(instructor => ({
				...instructor,
				status: statusGroup.status
			}))
		)
	}, [report])

	// Extract unique status values for dropdown filter
	const statusOptions = useMemo(() => {
		if (!Array.isArray(report)) return []
		return report.map(statusGroup => ({
			value: statusGroup.status,
			label: `${statusGroup.status} (${statusGroup.instructors.length})`
		}))
	}, [report])

	// Column definitions with integrated filters
	const staffingColumns = useMemo<ColumnDef<StaffMember, any>[]>(() => [
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
			accessorKey: "instructorSchoolYearGuid",
			header: () => <HeaderCell label="" />,
			cell: ({ row }) => (
				<div className='flex justify-center'>
					<a 
						href={`/home/admin/staff/${row.getValue("instructorSchoolYearGuid")}`}
						className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-1"
					>
						View
					</a>
				</div>
			),
			id: 'instructorSchoolYearGuid'
		}
	], [statusOptions])

	useEffect(() => {
		onRowCountChange(flattenedStaffData.length || 0)
	}, [flattenedStaffData])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		>
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={staffingColumns}
					data={flattenedStaffData}
					initialSorting={[{ id: 'lastName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Staffing for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(values, staffingFields, `Staffing_${fileOrgName}_${fileDate}`)}
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