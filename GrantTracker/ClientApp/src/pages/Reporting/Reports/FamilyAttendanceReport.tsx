
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { familyAttendanceFields, flattenFamilyAttendance } from '../Definitions/CSV'
import { familyAttendanceColumns } from '../Definitions/Columns'
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
		queryKey: [ `report/familyAttendance?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	})
	  
	const [daysAttendedFilter, setDaysAttendedFilter] = useState<string>('0')
	const [familyType, setFamilyType] = useState<string>('')

	useEffect(() => {
	  onRowCountChange(report?.length || 0)
	}, [report])

	const familyTypeOptions: string[] = useMemo<string[]>(() => [...new Set<string>(report?.flatMap(x => x.familyAttendance).map(attend => attend.familyMember))], [report])

	const filteredRecords: any[] = report?.map(x => ({...x, familyAttendance: x.familyAttendance.filter(y => familyType == '' || y.familyMember === familyType).filter(z => z.totalDays >= daysAttendedFilter)}))
		.filter(x => familyType == '' || x.familyAttendance.some(y => y.familyMember === familyType)) //filter those that don't have the specified family member
		.filter(x => x.familyAttendance.some(y => y.totalDays >= daysAttendedFilter)) || []
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayData={report}
			displayName={`Family Attendance Attendance for ${params.organizationName}, ${dateDisplay}`}
			fileData={flattenFamilyAttendance(filteredRecords)}
			fileName={`Family_Attendance_${fileOrgName}_${fileDate}`}
			fileFields={familyAttendanceFields}
		> 
			<Row className='my-3'>
				<Col md={3} className='p-0'>
					<Form.Select value={familyType} onChange={(e) => setFamilyType(e.target.value)}>
						{
							[
								<option value=''>All</option>,
								...familyTypeOptions.map(type => <option value={type}>{type}</option>)
							]
						}
					</Form.Select>
				</Col>
			</Row>

			<Row>
				<Col md={3} className='p-0'>
					<Form.Control 
						type='number' 
						className='border-bottom-0'
						placeholder='Minimum days...'
						value={daysAttendedFilter} 
						onChange={(e) => setDaysAttendedFilter(e.target.value)}
						style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
					/>
				</Col>

				<Col md={6}>
					<span className='ms-1'># of family members over {daysAttendedFilter || 0} days: <b>{filteredRecords.reduce((prev, curr, idx) => prev + curr.familyAttendance.length, 0)}</b> </span>
				</Col>
			</Row>
	
			<Row>
				<Table 
					className='m-0'
					columns={familyAttendanceColumns} 
					dataset={filteredRecords}
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