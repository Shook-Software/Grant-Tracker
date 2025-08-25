import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2"
import { Chart, ChartData, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, CategoryScale, BarElement, Title} from "chart.js"
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { studentAttendanceFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Button } from '@/components/ui/button';

Chart.register(BarElement, CategoryScale, PointElement, Tooltip, Legend, Title, ChartDataLabels); 

interface StudentAttendanceData {
	lastName: string
	firstName: string
	matricNumber: string
	grade: string
	totalDays: number
	totalHours: number
}

const studentAttendanceColumns: ColumnDef<StudentAttendanceData, any>[] = [
	{
		accessorKey: "lastName",
		header: ({ column }) => (
			<HeaderCell 
				label="Last Name" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'lastName'
	},
	{
		accessorKey: "firstName",
		header: ({ column }) => (
			<HeaderCell 
				label="First Name" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'firstName'
	},
	{
		accessorKey: "matricNumber",
		header: ({ column }) => (
			<HeaderCell 
				label="Matric Number" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
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
			/>
		),
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
				filterPlaceholder="Minimum days..."
			/>
		),
		filterFn: (row, id, value) => {
			const days = row.getValue(id) as number
			const minDays = parseFloat(value) || 0
			return days >= minDays
		},
		cell: ({ row }) => (
			<div className='text-center'>{Math.floor((row.getValue("totalDays") as number) * 100) / 100}</div>
		),
		id: 'totalDays'
	},
	{
		accessorKey: "totalHours",
		header: ({ column }) => (
			<HeaderCell 
				label="Total Hours" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		cell: ({ row }) => (
			<div className='text-center'>{Math.floor((row.getValue("totalHours") as number) * 100) / 100}</div>
		),
		id: 'totalHours'
	}
]

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	isActive: boolean
	onRowCountChange: (rows: number) => void
}

interface StudentDaysDTO {
	organizationGuid: string
	studentGuid: string
	daysAttended: number
}

function groupStudentAttendanceDaysIntoBuckets(studentDays: StudentDaysDTO[]) {
	return studentDays.reduce((dayRange, student) => {
		if (student.daysAttended >= 1)
			dayRange[0]++;
		if (student.daysAttended <= 10)
			dayRange[1]++;
		else if (student.daysAttended <= 20)
			dayRange[2]++;
		else if (student.daysAttended < 30)
			dayRange[3]++;
		else
			dayRange[4]++;

		return dayRange;
	}, [0, 0, 0, 0, 0])
}

export default ({params, dateDisplay, fileOrgName, fileDate, isActive, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/studentAttendance?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  })

	const { data: studentAttendanceDayCounts } = useQuery({ 
		queryKey: [`report/studentDaysAttended?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}`],
		retry: false,
		staleTime: Infinity,
		select: groupStudentAttendanceDaysIntoBuckets,
		enabled: !!params.startDate && !!params.endDate
	})

	useEffect(() => {
		onRowCountChange(report?.length || 0)
	}, [report])
	
	const barDataset: ChartData<"bar"> | undefined = studentAttendanceDayCounts ? {
		labels: ['>=1 Day', '1-10 Days', '11-20 Days', '21-29 Days', '30+ Days'],
		datasets: [
			{
				label: 'Student Count',
				data: studentAttendanceDayCounts,
				backgroundColor: '#C43138',
			}
		]
	} : undefined

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="flex flex-row gap-3">
				{barDataset && barDataset.datasets[0].data.some(value => value !== 0) &&
					<div className='max-h-[20rem]'>
						{barDataset ? 
							<Bar 
								data={barDataset}
								options={{
									plugins: {
										title: {
											display: true,
											text: 'Student Attendence by Range of Days Attended',
										},
										legend: {
											display: false
										},
										datalabels: {
											anchor: 'end', // Position of the labels
											align: 'end', // Align labels with the bars
											color: 'black', // Text color
											font: {
												size: 12,
												weight: 'bold',
											},
										},
									}
								}}
							/>
							: <></> 
						}
					</div>	
				}

				<div className="max-h-[45rem] overflow-auto relative">
					<DataTable 
						columns={studentAttendanceColumns}
						data={report || []}
						initialSorting={[{ id: 'lastName', desc: false }]}
						containerClassName="rounded border w-fit"
						tableClassName="table-auto w-auto self-start"
						title={`Total Student Attendance for ${params.organizationName}, ${dateDisplay}`}
						renderDownload={(values) => {
							if (values.length === 0) return <></>

							return (
								<Button
									className='mx-3'
									onClick={() => exportToCSV(values, studentAttendanceFields, `Student_Attendance_${fileOrgName}_${fileDate}`)}
									size='sm'
								>
									Save to CSV {values && values.length !== (report.length) ? `(${values.length} filtered rows)` : ''}
								</Button>
							)
						}}
					/>
				</div>
			</div>
		</ReportComponent>
	)
}