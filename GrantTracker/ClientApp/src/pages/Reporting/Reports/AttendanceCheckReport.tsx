import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { attendanceCheckFields, flattenAttendanceCheck } from '../Definitions/CSV'
import { attendanceCheckColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'
import { DateOnly } from 'Models/DateOnly'
import { TimeOnly } from 'Models/TimeOnly'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, onRowCountChange}: Props) => {

	const [attendanceCheckClassFilter, setAttendanceCheckFilter] = useState<string>('')

	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/attendanceCheck?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		select: (data) => data.map(x => ({
			...x,
			instanceDate: DateOnly.toLocalDate(x.instanceDate),
			timeBounds: x.timeBounds.map(t => ({
			  startTime: TimeOnly.toLocalTime(t.startTime),
			  endTime: TimeOnly.toLocalTime(t.endTime)
			}))
		  })),
		retry: false,
		staleTime: Infinity
	})

	useEffect(() => {
	  	onRowCountChange(report?.length || 0)
	}, [report?.length])

	const filteredReport = report?.filter(e => e.className?.toLocaleLowerCase().includes(attendanceCheckClassFilter)) || []
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayData={report}
			displayName={`Attendance Check for ${params.organizationName}, ${dateDisplay}`}
			fileData={() => flattenAttendanceCheck(filteredReport)}
			fileName={`Attendance_Check_${fileOrgName}_${fileDate}`}
			fileFields={attendanceCheckFields}
		>
			<Row>
				<Col sm={3} className='p-0'>
					<Form.Control 
						type='text' 
						className='border-bottom-0'
						placeholder='Filter sessions...'
						value={attendanceCheckClassFilter} 
						onChange={(e) => setAttendanceCheckFilter(e.target.value?.toLocaleLowerCase)}
						style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
					/>
				</Col>
			</Row>
			<Row>
				<Table 
					className='m-0'
					columns={attendanceCheckColumns} 
					dataset={filteredReport} 
					defaultSort={{index: 0, direction: SortDirection.Ascending}}
					maxHeight='45rem'
					tableProps={{
						size: 'sm',
						style: {minWidth: '1100px'}
					}}
				/>
			</Row>
		</ReportComponent>
	)
}