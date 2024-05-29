
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { studentAttendanceFields } from '../Definitions/CSV'
import { studentAttendanceColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/studentAttendance?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])
	  
	const [studentAttendMinDays, setStudentAttendMinDays] = useState<number>(0)

	const filteredReport = report?.filter(x => x.totalDays >= studentAttendMinDays) || []
	
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
				<Col md={3} className='p-0'>
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
		</ReportComponent>
	)
}