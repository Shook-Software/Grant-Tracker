import { useQuery } from '@tanstack/react-query'
import { TimeOnly } from 'Models/TimeOnly'
import { DateOnly } from 'Models/DateOnly'

import { ReportParameters } from '../ReportParameters'
import { createPayrollAuditColumns } from '../Definitions/Columns'
import { flattenPayrollReport, payrollAuditFields } from '../Definitions/CSV'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	onRowCountChange: (rows: number) => void
}

export default ({params, fileOrgName, fileDate, dateDisplay, onRowCountChange}: Props) => {
	  const { isPending, data, error } = useQuery({		
		queryKey: [ `report/payrollAudit?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		enabled: !!params?.startDate && !!params?.endDate,
		select: (rows: any[]) => rows.map(row => ({
			...row,
			instanceDate: DateOnly.toLocalDate(row.instanceDate),
			attendingInstructorRecords: row.attendingInstructorRecords.map(air => ({
				...air,
				timeRecords: air.timeRecords.map(tr => ({
					startTime: TimeOnly.toLocalTime(tr.startTime),
					endTime: TimeOnly.toLocalTime(tr.endTime),
					totalTime: tr.totalTime
				})),
			}))
		})),
		staleTime: Infinity,
		retry: false
	  })
  
	  return (
		  <ReportComponent
			  isLoading={isPending}
			  displayData={data}
			  displayName={`Payroll Audit Report  for ${params.organizationName}, ${dateDisplay}`}
			  fileData={() => flattenPayrollReport(data)}
			  fileName={`${fileOrgName}_Payroll_Audit_${fileDate}`}
			  fileFields={payrollAuditFields}
		  >
			  <div>
				  For Download Only
			  </div>
		  </ReportComponent>
	  )

	  /*
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
		*/
}