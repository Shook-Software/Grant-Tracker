import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { programOverviewFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Button } from '@/components/ui/button'

interface ProgramOverviewData {
	organizationName: string
	regularStudentCount: number
	familyAttendanceCount: number
	studentDaysOfferedCount: number
	avgStudentDailyAttendance: number
	avgStudentAttendDaysPerWeek: number
	avgStudentAttendHoursPerWeek: number
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
		queryKey: [ `report/programOverview?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])

	// Column definitions with integrated filters
	const programOverviewColumns = useMemo<ColumnDef<ProgramOverviewData, any>[]>(() => [
		{
			accessorKey: "organizationName",
			header: ({ column }) => (
				<HeaderCell 
					label="Organization" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search organizations..."
				/>
			),
			filterFn: (row, id, value) => {
				const organizationName = row.getValue(id) as string
				return organizationName?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'organizationName'
		},
		{
			accessorKey: "regularStudentCount",
			header: ({ column }) => (
				<HeaderCell 
					label="# of Regular Students" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min students..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("regularStudentCount")}</div>
			),
			id: 'regularStudentCount'
		},
		{
			accessorKey: "familyAttendanceCount",
			header: ({ column }) => (
				<HeaderCell 
					label="# of Family Attendees" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min family..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("familyAttendanceCount")}</div>
			),
			id: 'familyAttendanceCount'
		},
		{
			accessorKey: "studentDaysOfferedCount",
			header: ({ column }) => (
				<HeaderCell 
					label="Student Days Offered" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min days..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("studentDaysOfferedCount")}</div>
			),
			id: 'studentDaysOfferedCount'
		},
		{
			accessorKey: "avgStudentDailyAttendance",
			header: ({ column }) => (
				<HeaderCell 
					label="Avg Daily Unique Student Attendance" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min attendance..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("avgStudentDailyAttendance") as number) * 100) / 100}</div>
			),
			id: 'avgStudentDailyAttendance'
		},
		{
			accessorKey: "avgStudentAttendDaysPerWeek",
			header: ({ column }) => (
				<HeaderCell 
					label="Avg Attendance Days Per Week" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min days/week..."
				/>
			),
			filterFn: (row, id, value) => {
				const days = row.getValue(id) as number
				const minDays = parseFloat(value) || 0
				return days >= minDays
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("avgStudentAttendDaysPerWeek") as number) * 100) / 100}</div>
			),
			id: 'avgStudentAttendDaysPerWeek'
		},
		{
			accessorKey: "avgStudentAttendHoursPerWeek",
			header: ({ column }) => (
				<HeaderCell 
					label="Avg Attendance Hours Per Week" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min hours/week..."
				/>
			),
			filterFn: (row, id, value) => {
				const hours = row.getValue(id) as number
				const minHours = parseFloat(value) || 0
				return hours >= minHours
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("avgStudentAttendHoursPerWeek") as number) * 100) / 100}</div>
			),
			id: 'avgStudentAttendHoursPerWeek'
		}
	], [])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={programOverviewColumns}
					data={report || []}
					initialSorting={[{ id: 'organizationName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Program Overview for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(values, programOverviewFields, `Program_Overview_${fileOrgName}_${fileDate}`)}
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