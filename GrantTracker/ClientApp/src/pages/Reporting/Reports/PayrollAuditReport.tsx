import { useQuery } from '@tanstack/react-query'
import { TimeOnly } from 'Models/TimeOnly'
import { DateOnly } from 'Models/DateOnly'
import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"

import { ReportParameters } from '../ReportParameters'
import { flattenPayrollReport, payrollAuditFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { LocalDate, LocalTime } from '@js-joda/core'
import React from 'react'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface PayrollAuditReportRow {
	sessionGuid: string,
	attendanceGuid: string,
	school: string,
	className: string,
	activity: string,
	instanceDate: LocalDate,
	totalAttendees: number,
	attendingInstructorRecords: {
		firstName: string,
		lastName: string,
		isSubstitute: boolean,
		totalTime: string,
		timeRecords: {
			startTime: LocalTime,
			endTime: LocalTime,
			totalTime: string
		}[]
	}[]
}

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	isActive: boolean
	onRowCountChange: (rows: number) => void
}

export default ({params, fileOrgName, fileDate, dateDisplay, isActive, onRowCountChange}: Props) => {
	  const { isPending, data, error } = useQuery<PayrollAuditReportRow[]>({		
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
  
	if (!isActive)
		return null;

	  return (
		  <ReportComponent
			  isLoading={isPending}
			  hasError={!!error}
		  >
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable
					columns={columns}
					data={data || []}
					containerClassName="w-max"
					tableClassName="table-auto"
					title={`Payroll Audit Report for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						const flattened = flattenPayrollReport(data)
						
						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattened, payrollAuditFields, `${fileOrgName}_Payroll_Audit_${fileDate}`)}
								size='sm'
							>
								Save to CSV {flattened && values.length !== (data?.length) ? `(${flattened.length} filtered rows)` : ''}
							</Button>
						)
					}}
				/>
			</div>
		  </ReportComponent>
	)
}



const columns: ColumnDef<PayrollAuditReportRow, any>[] = [
	{
		accessorKey: "school",
		header: ({ column }) => (
			<HeaderCell 
				label="School" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'school'
	},
	{
		accessorKey: "className",
		header: ({ column }) => (
			<HeaderCell 
				label="Class Name" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value)}
				filterPlaceholder="Search names..."
			/>
		),
		filterFn: (row, id, value) => {
			const sessionName = row.getValue(id) as string
			return sessionName?.toLowerCase().includes(value.toLowerCase()) || false
		},
		cell: ({ row }) => (
			<Link to={`/home/admin/sessions/${row.original.sessionGuid}?tab=attendance&ar=${row.original.attendanceGuid}`}>
				<Button variant="link">{row.getValue("className")}</Button>
			</Link>
		),
		id: 'className'
	},
	{
		accessorKey: "activity",
		header: ({ column }) => (
			<HeaderCell 
				label="Activity" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'activity'
	},
	{
		accessorKey: "instanceDate",
		header: ({ column }) => (
			<HeaderCell 
				label="Date" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'instanceDate'
	},
	{
		accessorKey: "totalAttendees",
		header: ({ column }) => (
			<HeaderCell 
				label="# of Attendees" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'totalAttendees'
	},
	{
		accessorKey: "attendingInstructorRecords",
		header: ({ column }) => (
			<HeaderCell 
				label="Instructors" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
				className="text-center"
			/>
		),
		cell: ({ row }) => {
			const instructors = row.getValue("attendingInstructorRecords") as PayrollAuditReportRow['attendingInstructorRecords']
			return (
				<div style={{minWidth: 'fit-content'}}>
					{instructors?.map((instructor, index) => (
						<React.Fragment key={index}>
							<div className="flex">
								<div className='my-0 px-3' style={{minWidth: 'fit-content'}}>
									<div>{`${instructor.firstName} ${instructor.lastName}:`}</div>
									<div><TimeRecordDisplay timeRecords={instructor.timeRecords} /></div>
								</div>
								<div className="flex items-center">{instructor.totalTime} hrs</div>
							</div>
							{index === instructors.length - 1 ? null : <hr className='m-1'/>}
						</React.Fragment>
					))}
				</div>
			)
		},
		id: 'attendingInstructorRecords'
	},
]

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

			<div className="grid grid-cols-12">
				<Table 
					className='m-0'
					columns={createPayrollAuditColumns(payrollAuditAttendingFilter, payrollAuditRegisteredFilter)} 
					dataset={displayData} 
					defaultSort={{index: 0, direction: SortDirection.Ascending}}
					tableProps={{ size: 'sm', style: {minWidth: '1100px', borderCollapse: 'collapse', borderSpacing: '0 3px'}}}
					maxHeight='45rem'
				/>
			</div>
		</ReportComponent>
	)
		*/