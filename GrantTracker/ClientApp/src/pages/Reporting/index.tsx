import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Container, Row, Col, Tab, Nav, Form } from 'react-bootstrap'
import Table, { SortDirection } from 'components/BTable'

import ReportParameterInput, { ReportParameters } from './ReportParameters'

import Dropdown from 'components/Input/Dropdown'
import ReportComponent from './ReportComponent'
import { 
	activityReportColumns, 
	studentAttendanceColumns, 
	familyAttendanceColumns,
	siteSessionsColumns,
	summaryOfClassesColumns,
	programOverviewColumns,
	staffingColumns,
	studentSurveyColumns,
	attendanceCheckColumns,
	createPayrollAuditColumns
} from './Definitions/Columns'
import { 
	activityFields, 
	studentAttendanceFields, 
	familyAttendanceFields, flattenFamilyAttendance,
	siteSessionFields, flattenSiteSessions,
	summaryOfClassesFields, flattenSummaryOfClasses,
	programOverviewFields,
	staffingFields, flattenStaffing,
	studentSurveyFields,
	attendanceCheckFields, flattenAttendanceCheck, cclc10Fields
} from './Definitions/CSV'

import { getReportsAsync, getSiteSessions } from './api'
import { IdentityClaim } from 'utils/authentication'
import { useQuery } from '@tanstack/react-query'
import { DateOnly } from 'Models/DateOnly'
import { TimeOnly } from 'Models/TimeOnly'
import { LocalDate, LocalTime } from '@js-joda/core'

export default ({user}): JSX.Element => {
	const [reportParameters, setReportParameters] = useState<ReportParameters>({
		organizationGuid: undefined,
		organizationName: undefined,
		organizationYear: undefined,
		startDate: undefined,
		endDate: undefined
	})

	const [reports, setReports] = useState<any>({
		totalActivity: [],
		totalStudentAttendance: [],
		totalFamilyAttendance: [],
		siteSessions: [],
		classSummaries: [],
		programOverviews: [],
		staffSummaries: [],
		studentSurvey: [],
		attendanceCheck: [],
		payrollAudit: []
	})

	const [isLoading, setIsLoading] = useState<boolean>(false)

	//temp
	const [siteSessions, setSiteSessions] = useState<any[] | null>([])
	const [siteSessionsIsLoading, setSiteSessionsIsLoading] = useState<boolean>(false)

	const [studentAttendMinDays, setStudentAttendMinDays] = useState<number>(0)

	const [staffingStatusFilter, setStatusTypeFilter] = useState<string>('')
	const [staffingDropdownOptions, setStaffingDropdownOptions] = useState<any[] | null>([])

	const [attendanceCheckClassFilter, setAttendanceCheckFilter] = useState<string>('')

	const organizationFileString: string = reportParameters.organizationName?.replace(' ', '-') ?? ''

	const reportDateDisplayString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()} to ${reportParameters.endDate?.toString()}`

	const reportDateFileString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()}-${reportParameters.endDate?.toString()}`

	function handleParameterChange(form: ReportParameters): void {
		console.log(form)
		if (form.organizationGuid != undefined && form.year && form.startDate && form.endDate)
		{
			setIsLoading(true)
			setSiteSessionsIsLoading(true)

			getReportsAsync(form.startDate, form.endDate, form.year, form.organizationGuid)
				.then(res => {
					setReports(res)
				})
				.catch(err => {
					setReports(null)
				})
				.finally(() => {
					setIsLoading(false)
				})

			getSiteSessions(form.startDate, form.endDate, form.organizationGuid)
				.then(res => {
					setSiteSessions(res)
				})
				.catch(err => {
					console.warn(err)
				})
				.finally(() => {
					setSiteSessionsIsLoading(false)
				})
		}

		setReportParameters(form)
	}

	useEffect(() => {
		if (Array.isArray(reports.staffSummaries) && reports.staffSummaries.length > 0) {
			setStatusTypeFilter(reports.staffSummaries[0].status)
		
			let options = [
				{
					guid: 'all',
					label: `All (${reports.staffSummaries.reduce((total, current) => total + current.instructors.length, 0)})`
				},
				...reports.staffSummaries.map(statusGroup => ({
					guid: statusGroup.status,
					label: `${statusGroup.status} (${statusGroup.instructors.length})`
				}))
			]
	
			setStaffingDropdownOptions(options)
		}
	
	  }, [reports.staffSummaries])

	return (
		<Container style={{minWidth: '90vw'}}>
			<ReportParameterInput user={user} onSubmit={handleParameterChange} />

			<hr />

			<Row>
				<Tab.Container defaultActiveKey='student-attendance'>
					<Row className='d-flex flex-nowrap'>
						<div style={{maxWidth: 'fit-content'}}>
							<Row className='m-0' style={{width: 'fit-content'}}>
								<h4 className='text-center'>Report Type</h4>
							</Row>

							<Row style={{border: '1px solid black', borderRadius: '0.3rem', height: 'fit-content', width: 'fit-content'}}>
								<Nav variant='pills' className='flex-column p-0'>
									<Nav.Item>
										<Nav.Link eventKey='student-attendance'>
											Student Attendance ({reports.totalStudentAttendance.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='family-attendance'>
											Family Attendance ({reports.totalFamilyAttendance.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='activities'>
											Activities ({reports.totalActivity.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='site-sessions'>
											Site Sessions ({siteSessions?.length ?? 0})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='summary-of-classes'>
											Summary of Classes ({reports.classSummaries.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='program-overview'>
											Program Overview ({reports.programOverviews.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='staffing'>
											Staffing ({reports.staffSummaries.flat().length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='student-survey'>
											Student Surveys ({reports.studentSurvey.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='attendance-check'>
											Attendance Check ({reports.attendanceCheck.length})
										</Nav.Link>
									</Nav.Item>

									{
										user.claim == IdentityClaim.Administrator ?
											<Nav.Item>
												<Nav.Link eventKey='payroll-audit'>
													Payroll Audit ({reports.payrollAudit.length})
												</Nav.Link>
											</Nav.Item>
										: null
									}

									{
										user.claim == IdentityClaim.Administrator ?
											<Nav.Item>
												<Nav.Link eventKey='cclc10'>
													AzEDS CCLC10
												</Nav.Link>
											</Nav.Item>
										: null
									}
									
								</Nav>
							</Row>

						</div>
						
						<div className='flex-fill ps-3'>
							<Tab.Content>

								<Tab.Pane eventKey='student-attendance'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.totalStudentAttendance}
										displayName={`Total Student Attendance for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={reports?.totalStudentAttendance}
										fileName={`Student_Attendance_${organizationFileString}_${reportDateFileString}`}
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
												<span className='ms-1'># of students over {studentAttendMinDays} days: <b>{reports?.totalStudentAttendance.filter(x => x.totalDays >= studentAttendMinDays).length}</b> </span>
											</Col>
										</Row>
								
										<Row>
											<Table 
												className='m-0'
												columns={studentAttendanceColumns} 
												dataset={reports?.totalStudentAttendance.filter(x => x.totalDays >= studentAttendMinDays)}
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='family-attendance'>
									<FamilyEngagementReport 
										isLoading={isLoading}
										reportParameters={reportParameters}
										fileName={`Family_Attendance_${organizationFileString}_${reportDateFileString}`}
										reportDateDisplayString={reportDateDisplayString}
										records={reports?.totalFamilyAttendance}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='activities'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.totalActivity}
										displayName={`Total Activity for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={reports?.totalActivity}
										fileName={`Total_Activity_${organizationFileString}_${reportDateFileString}`}
										fileFields={activityFields}
									>
										<Row>
											<Table 
												className='m-0'
												columns={activityReportColumns} 
												dataset={reports?.totalActivity} 
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='site-sessions'>
									<ReportComponent
										isLoading={siteSessionsIsLoading}
										displayData={siteSessions}
										displayName={`Site Sessions for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={flattenSiteSessions(siteSessions)}
										fileName={`Site_Sessions_${organizationFileString}_${reportDateFileString}`}
										fileFields={siteSessionFields}
									>
										<Row>
											<Table 
												className='m-0'
												columns={siteSessionsColumns} 
												dataset={siteSessions} 
												defaultSort={{index: 1, direction: SortDirection.Ascending}}
												maxHeight='45rem'
												tableProps={{
												  size: 'sm',
												  style: {
													overflowY: 'scroll',
													overflowX: 'visible'
												  }
												}}
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='summary-of-classes'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.classSummaries}
										displayName={`Summary of Classes for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={flattenSummaryOfClasses(reports?.classSummaries)}
										fileName={`Summary_Of_Classes_${organizationFileString}_${reportDateFileString}`}
										fileFields={summaryOfClassesFields}
									>
										<Row>
											<Table 
												className='m-0'
												columns={summaryOfClassesColumns} 
												dataset={reports?.classSummaries} 
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
												tableProps={{
												  size: 'sm'
												}}
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='program-overview'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.programOverviews}
										displayName={`Program Overview for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={reports?.programOverviews}
										fileName={`Program_Overview_${organizationFileString}_${reportDateFileString}`}
										fileFields={programOverviewFields}
									>
										<Row>
											<Table 
												className='m-0'
												columns={programOverviewColumns} 
												dataset={reports?.programOverviews} 
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
												tableProps={{
												  size: 'sm'
												}}
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='staffing'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.staffSummaries}
										displayName={`Staffing for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={flattenStaffing(reports?.staffSummaries)}
										fileName={`Staffing_${organizationFileString}_${reportDateFileString}`}
										fileFields={staffingFields}
									>
										<Row class='d-flex flex-row'>
											<Row>
												<Form.Group className='mb-3'>
													<Form.Label>Staff Status Type</Form.Label>
													<Dropdown  
														value={staffingStatusFilter}
														options={staffingDropdownOptions}
														onChange={(status: string) => setStatusTypeFilter(status)}
													/>
												</Form.Group>
											</Row>
							
											<Row>
												<Table 
													className='m-0'
													columns={staffingColumns} 
													dataset={reports?.staffSummaries.find(statusGroup => statusGroup.status === staffingStatusFilter)?.instructors} 
													defaultSort={{index: 0, direction: SortDirection.Ascending}}
													maxHeight='45rem'
													tableProps={{
														size: 'sm'
													}}
												/>
											</Row>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='student-survey'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.studentSurvey}
										displayName={`Student Survey for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={reports?.studentSurvey}
										fileName={`Student_Survey_${organizationFileString}_${reportDateFileString}`}
										fileFields={studentSurveyFields}
									>
										<Row >
											<Table 
												className='m-0'
												columns={studentSurveyColumns} 
												dataset={reports?.studentSurvey} 
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
												tableProps={{
												  size: 'sm'
												}}
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='attendance-check'>
									<ReportComponent
										isLoading={isLoading}
										displayData={reports?.attendanceCheck}
										displayName={`Attendance Check for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
										fileData={flattenAttendanceCheck(reports?.attendanceCheck)}
										fileName={`Attendance_Check_${organizationFileString}_${reportDateFileString}`}
										fileFields={attendanceCheckFields}
									>
										<Row>
											<Col sm={3} className='p-0'>
												<Form.Control 
													type='text' 
													className='border-bottom-0'
													placeholder='Filter sessions...'
													value={attendanceCheckClassFilter} 
													onChange={(e) => setAttendanceCheckFilter(e.target.value.toLocaleLowerCase())}
													style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
												/>
											</Col>
										</Row>
										<Row>
											<Table 
												className='m-0'
												columns={attendanceCheckColumns} 
												dataset={reports?.attendanceCheck.filter(e => e.className.toLocaleLowerCase().includes(attendanceCheckClassFilter))} 
												defaultSort={{index: 0, direction: SortDirection.Ascending}}
												maxHeight='45rem'
												tableProps={{
													size: 'sm',
													style: {minWidth: '1100px'}
												}}
											/>
										</Row>
									</ReportComponent>
								</Tab.Pane>

								<Tab.Pane eventKey='payroll-audit'>
									<PayrollAuditReport 
										isLoading={isLoading} 
										reportParameters={reportParameters}
										reportDateDisplayString={reportDateDisplayString}
										records={reports?.payrollAudit}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='cclc10'>
									<CCLC10Report
										reportParameters={reportParameters}
										dateDisplayString={reportDateDisplayString}
										fileName={`AzEDS_CCLC10_Grant_Tracker_${reportDateFileString}`}
									/>
								</Tab.Pane>

							</Tab.Content>
						</div>
					</Row>
				</Tab.Container>
			</Row>
			
		</Container>
	)
}

const FamilyEngagementReport = ({isLoading, reportParameters, fileName, reportDateDisplayString, records}): React.ReactElement => { 
	const [daysAttendedFilter, setDaysAttendedFilter] = useState<string>('0')
	const [familyType, setFamilyType] = useState<string>('')

	const familyTypeOptions: string[] = useMemo<string[]>(() => [...new Set<string>(records.flatMap(x => x.familyAttendance).map(attend => attend.familyMember))], [records])

	const filteredRecords: any[] = records
		.map(x => ({...x, familyAttendance: x.familyAttendance.filter(y => familyType == '' || y.familyMember === familyType).filter(z => z.totalDays >= daysAttendedFilter)}))
		.filter(x => familyType == '' || x.familyAttendance.some(y => y.familyMember === familyType)) //filter those that don't have the specified family member
		.filter(x => x.familyAttendance.some(y => y.totalDays >= daysAttendedFilter))

	return (
		<ReportComponent
			isLoading={isLoading}
			displayData={records}
			displayName={`Family Attendance for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
			fileData={flattenFamilyAttendance(records)}
			fileName={fileName}
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
				/>
			</Row>
		</ReportComponent>
	)
}


const PayrollAuditReport = ({isLoading, reportParameters, reportDateDisplayString, records}): JSX.Element => {
	const [payrollAuditRegisteredFilter, setPayrollAuditRegisteredFilter] = useState<string>('')
	const [payrollAuditAttendingFilter, setPayrollAuditAttendingFilter] = useState<string>('')

	const displayData: any[] = records
		.filter(e => e.attendingInstructorRecords.some(air => `${air.firstName} ${air.lastName}`.toLocaleLowerCase().includes(payrollAuditAttendingFilter.toLocaleLowerCase()))
			&& e.registeredInstructors.some(ri => `${ri.firstName} ${ri.lastName}`.toLocaleLowerCase().includes(payrollAuditRegisteredFilter.toLocaleLowerCase()))
		)  

	return (
		<ReportComponent
			isLoading={isLoading}
			displayData={records}
			displayName={`Payroll Audit for ${reportParameters.organizationName}, ${reportDateDisplayString}`}
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
					tableProps={{style: {minWidth: '1100px', borderCollapse: 'collapse', borderSpacing: '0 3px'}}}
					maxHeight='45rem'
				/>
			</Row>
		</ReportComponent>
	)
}

interface CCLC10Row {
	school: string
	matricNumber: string
	lastName: string
	firstName: string
	session: string
	date: LocalDate
	startTime: LocalTime
	endTime: LocalTime
	activity: string
}

const CCLC10Report = ({reportParameters, dateDisplayString, fileName}): ReactElement => {

	const { isPending, data, error } = useQuery<CCLC10Row[]>({
		queryKey: [`report/CCLC10?startDateStr=${reportParameters.startDate}&endDateStr=${reportParameters.endDate}`],
		enabled: !!reportParameters?.startDate && !!reportParameters?.endDate,
		select: (rows: any[]) => rows.map(row => ({
			...row,
			date: DateOnly.toLocalDate(row.date),
			startTime: TimeOnly.toLocalTime(row.startTime),
			endTime: TimeOnly.toLocalTime(row.endTime)
		})),
		staleTime: Infinity,
		retry: false
	})

	return (
		<ReportComponent
			isLoading={isPending}
			displayData={data}
			displayName={`AzEDS CCLC10 Report for all Organizations, ${dateDisplayString}`}
			fileData={data}
			fileName={fileName}
			fileFields={cclc10Fields}
		>
			<div>
				For Download Only
			</div>
		</ReportComponent>
	)
}