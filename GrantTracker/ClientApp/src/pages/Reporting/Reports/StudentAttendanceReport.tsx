
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Col, Row, Form } from 'react-bootstrap'
import { Bar } from "react-chartjs-2"
import { Chart, ChartData, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, CategoryScale, BarElement, Title} from "chart.js"
import ChartDataLabels from 'chartjs-plugin-datalabels';

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { studentAttendanceFields } from '../Definitions/CSV'
import { studentAttendanceColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'

Chart.register(BarElement, CategoryScale, PointElement, Tooltip, Legend, Title, ChartDataLabels); 

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
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

export default ({params, dateDisplay, fileOrgName, fileDate, onRowCountChange}: Props) => {
	  
	const [studentAttendMinDays, setStudentAttendMinDays] = useState<number>(0)
	
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/studentAttendance?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	  })

	const { data: studentAttendanceDayCounts } = useQuery({ 
		queryKey: [`report/studentDaysAttended?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}`],
		retry: false,
		staleTime: Infinity,
		select: groupStudentAttendanceDaysIntoBuckets
	})

	useEffect(() => {
		onRowCountChange(report?.length || 0)
	}, [report])

	const filteredReport = report?.filter(x => x.totalDays >= studentAttendMinDays) || []

	
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
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayData={filteredReport}
			displayName={`Total Student Attendance for ${params.organizationName}, ${dateDisplay}`}
			fileData={filteredReport}
			fileName={`Student_Attendance_${fileOrgName}_${fileDate}`}
			fileFields={studentAttendanceFields}
		> 
	
			<Row>
				<Col sm={3}>
					<div>
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
				</Col>

				<Col sm={9}>
					<Row>
						<Col md={3} >
							<Form.Control 
								type='number' 
								className='border-bottom-0'
								placeholder='Minimum days...'
								value={studentAttendMinDays} 
								onChange={(e) => setStudentAttendMinDays(e.target.value)}
								style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
							/>
						</Col>

						<Col md={6}>
							<span className='ms-1'># of students over {studentAttendMinDays} days: <b>{filteredReport?.length}</b> </span>
						</Col>
					</Row>

					<Row>
						<Table 
							className='m-0'
							columns={studentAttendanceColumns} 
							dataset={filteredReport}
							defaultSort={{index: 0, direction: SortDirection.Ascending}}
							maxHeight='45rem'
							tableProps={{
								size: 'sm'
							}}
						/>
					</Row>
				</Col>
			</Row>
		</ReportComponent>
	)
}