import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { createPayrollAuditColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/payrollAudit?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	  })
	  
	  const [payrollAuditRegisteredFilter, setPayrollAuditRegisteredFilter] = useState<string>('')
	  const [payrollAuditAttendingFilter, setPayrollAuditAttendingFilter] = useState<string>('')

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])
  
	  const displayData: any[] = report?.filter(e => e.attendingInstructorRecords.some(air => `${air.firstName} ${air.lastName}`.toLocaleLowerCase().includes(payrollAuditAttendingFilter.toLocaleLowerCase()))
			  && e.registeredInstructors.some(ri => `${ri.firstName} ${ri.lastName}`.toLocaleLowerCase().includes(payrollAuditRegisteredFilter.toLocaleLowerCase()))
		  )  
	
	return (	
		<ReportComponent
			isLoading={isPending}
			displayData={displayData}
			displayName={`Payroll Audit for ${params.organizationName}, ${dateDisplay}`}
		>
			<Form.Group as={Row} sm='3' className='p-0 mb-1' controlId='payroll-registered-instructors'>
				<Form.Label column sm='2'>Registered Instructor</Form.Label>
				<Col sm={10}>
					<Form.Control 
						type='text'
						placeholder='Filter registered instructors...'
						value={payrollAuditRegisteredFilter} 
						onChange={(e) => setPayrollAuditRegisteredFilter(e.target.value)}
					/>
				</Col>
			</Form.Group>
			
			<Form.Group as={Row} sm='3' className='p-0 mb-1' controlId='payroll-attending-instructors'>
				<Form.Label column sm='2'>Attending Instructor</Form.Label>
				<Col sm={10}>
					<Form.Control 
						type='text' 
						placeholder='Filter attending instructors...'
						value={payrollAuditAttendingFilter} 
						onChange={(e) => setPayrollAuditAttendingFilter(e.target.value)}
					/>
				</Col>
			</Form.Group>

			<Row>
				<Table 
					className='m-0'
					columns={createPayrollAuditColumns(payrollAuditAttendingFilter, payrollAuditRegisteredFilter)} 
					dataset={displayData} 
					defaultSort={{index: 0, direction: SortDirection.Ascending}}
					tableProps={{ size: 'sm', style: {minWidth: '1100px', borderCollapse: 'collapse', borderSpacing: '0 3px'}}}
					maxHeight='45rem'
				/>
			</Row>
		</ReportComponent>
	)
}