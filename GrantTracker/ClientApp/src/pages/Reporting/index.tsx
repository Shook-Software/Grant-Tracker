import { useReducer, useState } from 'react'
import { Container, Row, Tab, Nav } from 'react-bootstrap'

import ReportParameterInput, { ReportParameters } from './ReportParameters'

import StudentAttendanceReport from './Reports/StudentAttendanceReport'
import FamilyAttendanceReport from './Reports/FamilyAttendanceReport'
import ActivityReport from './Reports/ActivityReport'
import SiteSessionsReport from './Reports/SiteSessionsReport'
import AttendanceCheckReport from './Reports/AttendanceCheckReport'
import PayrollAuditReport from './Reports/PayrollAuditReport'
import ProgramOverviewReport from './Reports/ProgramOverviewReport'
import StudentSurveyReport from './Reports/StudentSurveyReport'
import SummaryOfClassesReport from './Reports/SummaryOfClassesReport'
import StaffingReport from './Reports/StaffingReport'
import CCLC10Report from './Reports/CCLC10Report'
import ScheduleReport from './Reports/ScheduleReport'
import AllStaffReport from './Reports/StaffMemberReport'

import { IdentityClaim } from 'utils/authentication'

type ReducerAction = 
| { type: 'activity', payload: number }
	| { type: 'attendanceCheck', payload: number }
	| { type: 'family', payload: number }
	| { type: 'payroll', payload: number }
	| { type: 'program', payload: number }
	| { type: 'site', payload: number }
	| { type: 'staff', payload: number }
	| { type: 'studentAttendance', payload: number }
	| { type: 'studentSurvey', payload: number }
	| { type: 'classes', payload: number }

function reducer (state, action: ReducerAction) {

	switch (action.type) {
		case 'activity':
		  	return { ...state, activity: action.payload }

		case 'attendanceCheck':
			return { ...state, attendanceCheck: action.payload }

		case 'family':
			return { ...state, family: action.payload }

		case 'site':
			return { ...state, site: action.payload }

		case 'payroll':
			return { ...state, payroll: action.payload }

		case 'program':
			return { ...state, program: action.payload }

		case 'staff':
			return { ...state, staff: action.payload }

		case 'studentAttendance':
			return { ...state, studentAttendance: action.payload }

		case 'studentSurvey':
			return { ...state, studentSurvey: action.payload }

		case 'classes':
			return { ...state, classes: action.payload }

		default: 
			return { ...state }
	}
}

export default ({user}): JSX.Element => {
	const [reportParameters, setReportParameters] = useState<ReportParameters>({
		organizationGuid: undefined,
		organizationName: undefined,
		year: undefined,
		startDate: undefined,
		endDate: undefined
	})

	const [reportRowCounts, dispatchRowCounts] = useReducer(reducer, {
		activity: 0,
		attendanceCheck: 0,
		family: 0,
		payroll: 0,
		program: 0,
		site: 0,
		staff: 0,
		studentAttendance: 0,
		studentSurvey: 0,
		classes: 0
	})

	const organizationFileString: string = reportParameters.organizationName?.replace(' ', '-') ?? ''

	const reportDateDisplayString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()} to ${reportParameters.endDate?.toString()}`

	const reportDateFileString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()}_${reportParameters.endDate?.toString()}`

	function handleParameterChange(form: ReportParameters): void {
		setReportParameters(form)
	}


	return (
		<Container style={{minWidth: '90vw'}}>
			<ReportParameterInput user={user} onSubmit={handleParameterChange} />

			<hr />

			{ reportParameters.organizationName ?			
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
											Student Attendance ({reportRowCounts.studentAttendance})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='family-attendance'>
											Family Attendance ({reportRowCounts.family})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='activities'>
											Activities ({reportRowCounts.activity})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='site-sessions'>
											Site Sessions ({reportRowCounts.site})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='summary-of-classes'>
											Summary of Classes ({reportRowCounts.classes})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='program-overview'>
											Program Overview ({reportRowCounts.program})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='staffing'>
											Staffing ({reportRowCounts.staff})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='student-survey'>
											Student Surveys ({reportRowCounts.studentSurvey})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='attendance-check'>
											Attendance Check ({reportRowCounts.attendanceCheck})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='payroll-audit'>
											Payroll Audit
										</Nav.Link>
									</Nav.Item>
									
									{
										user.claim == IdentityClaim.Administrator ?
											<Nav.Item>
												<Nav.Link eventKey='cclc10'>
													AzEDS CCLC10
												</Nav.Link>
											</Nav.Item>
										: null
									}

									<Nav.Item>
										<Nav.Link eventKey='schedule'>
											Instructor Schedule
										</Nav.Link>
									</Nav.Item>

									{
										user.claim == IdentityClaim.Administrator ?
											<Nav.Item>
												<Nav.Link eventKey='all-staff'>
													All Staff
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
									<StudentAttendanceReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'studentAttendance', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='family-attendance'>
									<FamilyAttendanceReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'family', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='activities'>
									<ActivityReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'activity', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='site-sessions'>
									<SiteSessionsReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'site', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='summary-of-classes'>
									<SummaryOfClassesReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'classes', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='program-overview'>
									<ProgramOverviewReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'program', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='staffing'>
									<StaffingReport 
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'staff', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='student-survey'>
									<StudentSurveyReport
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'studentSurvey', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='attendance-check'>
									<AttendanceCheckReport
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'attendanceCheck', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='payroll-audit'>
									<PayrollAuditReport
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={reportDateFileString}
										onRowCountChange={(rows: number) => dispatchRowCounts({ type: 'payroll', payload: rows })}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='cclc10'>
									<CCLC10Report
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='schedule'>
									<ScheduleReport
										params={reportParameters}
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={`${reportParameters?.year?.startDate?.toString()}_${reportParameters?.year?.endDate?.toString()}`}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='all-staff'>
									<AllStaffReport
										dateDisplay={reportDateDisplayString}
										fileOrgName={organizationFileString}
										fileDate={`${reportParameters?.year?.startDate?.toString()}_${reportParameters?.year?.endDate?.toString()}`}
									/>
								</Tab.Pane>

							</Tab.Content>
						</div>
					</Row>
				</Tab.Container>
			</Row>
			: null }
			
		</Container>
	)
}