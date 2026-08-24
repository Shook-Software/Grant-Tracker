import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Quarter } from 'Models/OrganizationYear'
import { Button } from '@/components/ui/button'

// Raw API shape: one row per (instructor school year x distinct funding source
// snapshotted on their attendance records); fundingSource is null when a staff
// member has no attended, funded sessions.
interface StaffMemberRow {
	organizationName: string
	schoolYear: string
	quarter: number
	instructorSchoolYearGuid: string
	badgeNumber: string
	status: string
	lastName: string
	firstName: string
	title: string | null
	fundingSource: string | null
}

// Display shape: regrouped to one row per instructor school year.
interface StaffMemberData {
	organizationName: string
	schoolYear: string
	quarter: number
	instructorSchoolYearGuid: string
	badgeNumber: string
	status: string
	lastName: string
	firstName: string
	title: string | null
	fundingSources: string[]
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
	
	// Collapse the funding-source multiplicity back to one row per instructor school year.
	const groupedStaff = useMemo<StaffMemberData[]>(() => {
		if (!Array.isArray(report)) return []

		const rowsByISY = new Map<string, StaffMemberData>()

		for (const row of report as StaffMemberRow[]) {
			let grouped = rowsByISY.get(row.instructorSchoolYearGuid)
			if (!grouped) {
				grouped = { ...row, fundingSources: [] }
				rowsByISY.set(row.instructorSchoolYearGuid, grouped)
			}
			if (row.fundingSource && !grouped.fundingSources.includes(row.fundingSource))
				grouped.fundingSources.push(row.fundingSource)
		}

		rowsByISY.forEach(row => row.fundingSources.sort())
		return [...rowsByISY.values()]
	}, [report])

	const organizationOptions = useMemo(() => [...new Set(groupedStaff.map(r => r.organizationName).filter(Boolean))].map(v => ({ value: v, label: v })), [groupedStaff])
	const schoolYearOptions = useMemo(() => [...new Set(groupedStaff.map(r => r.schoolYear).filter(Boolean))].map(v => ({ value: v, label: v })), [groupedStaff])
	const quarterOptions = useMemo(() => [...new Set(groupedStaff.map(r => r.quarter).filter(q => q !== undefined))].map(q => ({ value: q.toString(), label: Quarter[q] })), [groupedStaff])
	const statusOptions = useMemo(() => [...new Set(groupedStaff.map(r => r.status).filter(Boolean))].map(v => ({ value: v, label: v })), [groupedStaff])

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
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<HeaderCell
					label="Title"
					sort={column.getIsSorted()}
					onSortClick={() => column.toggleSorting()}
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search titles..."
				/>
			),
			filterFn: (row, id, value) => {
				const title = row.getValue(id) as string
				return title?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'title'
		},
		{
			// Joined string for sorting/filtering; the cell renders the underlying list vertically.
			accessorFn: row => row.fundingSources.join(', '),
			header: ({ column }) => (
				<HeaderCell
					label="Funding Source(s)"
					sort={column.getIsSorted()}
					onSortClick={() => column.toggleSorting()}
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search funding sources..."
				/>
			),
			filterFn: (row, id, value) => {
				const fundingSources = row.getValue(id) as string
				return fundingSources?.toLowerCase().includes(value.toLowerCase()) || false
			},
			cell: ({ row }) => (
				<div className='flex flex-col gap-1'>
					{row.original.fundingSources.map(fundingSource => (
						<div key={fundingSource}>{fundingSource}</div>
					))}
				</div>
			),
			id: 'fundingSources'
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
					data={groupedStaff}
					initialSorting={[{ id: 'organizationName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={'All Staff, All Years'}
					renderDownload={(values: StaffMemberData[]) => {
						if (values.length === 0) return <></>

						// Re-flatten for CSV: one row per funding source, or a single row with a blank
						// funding source for staff who have none on their attendance records.
						const flattenForCSV = () => values.flatMap(row => {
							const base = { ...row, quarter: Quarter[row.quarter] }
							return row.fundingSources.length > 0
								? row.fundingSources.map(fundingSource => ({ ...base, fundingSource }))
								: [{ ...base, fundingSource: '' }]
						})

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattenForCSV(), fields, 'All_Staff')}
								size='sm'
							>
								Save to CSV {values && values.length !== (groupedStaff.length) ? `(${values.length} filtered rows)` : ''}
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
	{
		label: 'Title',
		value: 'title'
	},
	{
		label: 'Funding Source',
		value: 'fundingSource'
	},
]