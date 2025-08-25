import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { studentSurveyFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Button } from '@/components/ui/button'

interface StudentSurveyData {
	lastName: string
	firstName: string
	objective: string
	matricNumber: string
	grade: string
	totalDays: number
	totalHours: number
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
		queryKey: [ `report/studentSurvey?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])

	const objectiveOptions = useMemo(() => [...new Set(report?.map(r => r.objective).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const gradeOptions = useMemo(() => [...new Set(report?.map(r => r.grade).filter(Boolean))].map(v => ({ value: v, label: v })), [report])

	const studentSurveyColumns = useMemo<ColumnDef<StudentSurveyData, any>[]>(() => [
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
			accessorKey: "objective",
			header: ({ column }) => (
				<HeaderCell 
					label="Objective" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={objectiveOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'objective'
		},
		{
			accessorKey: "matricNumber",
			header: ({ column }) => (
				<HeaderCell 
					label="Matric Number" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search matric numbers..."
				/>
			),
			filterFn: (row, id, value) => {
				const matric = row.getValue(id) as string
				return matric?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'matricNumber'
		},
		{
			accessorKey: "grade",
			header: ({ column }) => (
				<HeaderCell 
					label="Grade" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={gradeOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("grade")}</div>
			),
			id: 'grade'
		},
		{
			accessorKey: "totalDays",
			header: ({ column }) => (
				<HeaderCell 
					label="Total Days" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min days..."
				/>
			),
			filterFn: (row, id, value) => {
				const days = row.getValue(id) as number
				const minDays = parseFloat(value) || 0
				return days >= minDays
			},
			cell: ({ row }) => {
				const days = row.getValue("totalDays") as number
				return <div className='text-center'>{Math.floor(days * 100) / 100}</div>
			},
			id: 'totalDays'
		},
		{
			accessorKey: "totalHours",
			header: ({ column }) => (
				<HeaderCell 
					label="Total Hours" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min hours..."
				/>
			),
			filterFn: (row, id, value) => {
				const hours = row.getValue(id) as number
				const minHours = parseFloat(value) || 0
				return hours >= minHours
			},
			cell: ({ row }) => {
				const hours = row.getValue("totalHours") as number
				return <div className='text-center'>{Math.floor(hours * 100) / 100}</div>
			},
			id: 'totalHours'
		}
	], [objectiveOptions, gradeOptions])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={studentSurveyColumns}
					data={report || []}
					initialSorting={[{ id: 'lastName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Student Survey for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(values, studentSurveyFields, `Student_Survey_${fileOrgName}_${fileDate}`)}
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