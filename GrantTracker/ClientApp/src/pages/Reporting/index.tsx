import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Tab, Nav, Button } from 'react-bootstrap'
import SelectSearch from 'components/Input/SelectSearch'

import StudentAttendance from './StudentAttendance'
import FamilyAttendance from './FamilyAttendance'
import Activities from './Activities'
import SiteSessions from './SiteSessions'
import SummaryOfClasses from './SummaryOfClasses'
import ProgramOverview from './ProgramOverview'
import StaffingSummary from './Staffing'
import StudentSurvey from './StudentSurveys'

import { OrganizationView, OrganizationYearView, Quarter, YearView } from 'models/OrganizationYear'

import { AxiosIdentityConfig } from 'utils/api'
import { getAuthorizedOrganizations, getOrganizationYears, getReportsAsync } from './api'
import { getSiteSessions } from './api'
import Dropdown from 'components/Input/Dropdown'
import { DropdownOption } from 'Models/Session'
import { DateOnly } from 'Models/DateOnly'
import { LocalDate } from '@js-joda/core'

//this could be entirely rewritten, I really hate it
const ParamSelection = ({onSubmit}): JSX.Element => {
	const [form, setForm] = useState<any>({schoolyear: {
		startDate: '2022-01-01',//DateOnly.toLocalDate(startDateOfSchoolYear),
		endDate: '2023-08-01'}})//DateOnly.toLocalDate(endDateOfSchoolYear),}})
	const [orgYear, setOrgYear] = useState<any/*{orgGuid, yearGuid, orgYearGuid}*/>({...AxiosIdentityConfig.identity})
	const [orgs, setOrgs] = useState<OrganizationView[]>([])
	const [orgYears, setOrgYears] = useState<OrganizationYearView[]>([])

	function handleSchoolYearChange(year: YearView, orgYears: OrganizationYearView[]): void {
		let currentSemesters = orgYears.filter(orgYear => orgYear.year.schoolYear == year.schoolYear)
		//console.log(schoolYear, currentSemesters, orgYears)
		let startDateOfSchoolYear = currentSemesters[0].year.startDate
		let endDateOfSchoolYear = currentSemesters[currentSemesters.length - 1].year.endDate

		setForm({...form, schoolYear: {
			startDate: DateOnly.toLocalDate(startDateOfSchoolYear),
			endDate:  DateOnly.toLocalDate(endDateOfSchoolYear),
			year: year.schoolYear,
			quarter: year.quarter
		}})
	}

	function handleOrgChange(orgGuid) {
		getOrganizationYears(orgGuid)
			.then(res => {
				setOrgYears(res)
				let currentSchoolYear: OrganizationYearView | undefined = res.find(orgYear => orgYear.year.isCurrentYear)
				setOrgYear({...orgYear, organizationYearGuid: currentSchoolYear.guid})
				let currentYear: YearView = currentSchoolYear!.year
				handleSchoolYearChange(currentYear, res)	

				//messy, can rewrite soon, maybe, just ensures data is loaded upon page load
				let currentSemesters = res.filter(orgYear => orgYear.year.schoolYear == currentYear.schoolYear)
				//console.log(schoolYear, currentSemesters, orgYears)
				let startDateOfSchoolYear = currentSemesters[0].year.startDate
				let endDateOfSchoolYear = currentSemesters[currentSemesters.length - 1].year.endDate

				onSubmit({
					schoolYear: {
						year: currentYear.schoolYear,
						quarter: currentYear.quarter,
						startDate: DateOnly.toLocalDate(startDateOfSchoolYear),
						endDate: DateOnly.toLocalDate(endDateOfSchoolYear)
					},
					orgGuid: orgYear.organizationGuid
				})

			})
			.catch(err => {
				console.warn(err)
			})
	}

	useEffect(() => {
		getAuthorizedOrganizations()
			.then(res => {
				res = [
				{ 
					guid: null,
					name: 'All Organizations',
					organizationYears: []
				},
					...res
				]

				setOrgs(res)
			})
			.catch(err => {
				console.warn(err)
			})
	}, [])
	
	useEffect(() => {
		handleOrgChange(orgYear.organizationGuid)
	}, [orgYear.organizationGuid])

	const orgOptions = orgs.map(org => ({
		value: org.guid,
		name: org.name,
	}))

	const orgYearOptions: DropdownOption[] = orgYears.map(orgYear => ({
		guid: orgYear.guid,
		label: `${orgYear.year.schoolYear} - ${Quarter[orgYear.year.quarter]}`
	}))

	console.log(form?.schoolyear?.startDate)

	return (
		<Container className='ms-0'>
			<Form>
				<Row>
					<Col lg='3'>
						<Form.Group>
							<Form.Label htmlFor='org'>Organization</Form.Label>
							<SelectSearch 
								id='org'
								options={orgOptions}
								value={orgYear.organizationGuid}
								handleChange={(orgGuid: string) => {
									setOrgYear({...orgYear, organizationGuid: orgGuid})
								}}
						    />
						</Form.Group>
					</Col>
					<Col lg='3'>
						<Form.Group>
							<Form.Label htmlFor='school-year'>School Year <small>(Affects Staffing Only)</small></Form.Label> 
							<Dropdown
								id='school-year'
								options={orgYearOptions}
								value={orgYear.organizationYearGuid}
								onChange={(orgYearGuid: string) => {
									let year = orgYears.find(orgYear => orgYear.guid == orgYearGuid).year
									handleSchoolYearChange(year, orgYears)
									setOrgYear({...orgYear, organizationYearGuid: orgYearGuid, yearGuid: year.guid})
								}}
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col lg='3' className='w-25'>
						<Form.Group>
							<Form.Label htmlFor='start-date'>Start Date</Form.Label>
							<Form.Control 
								type='date' 
								id='start-date' 
								value={form?.schoolYear?.startDate}
								onChange={(e) => setForm({...form, schoolYear: {
									...form.schoolYear,
									startDate: LocalDate.parse(e.target.value)
								}})}
							/>
						</Form.Group>
					</Col>

					<Col lg='3' className='w-25'>
						<Form.Group>
							<Form.Label htmlFor='end-date'>End Date</Form.Label>
							<Form.Control 
								type='date'
								id='end-date' 
								value={form?.schoolYear?.endDate}
								onChange={(e) => setForm({...form, schoolYear: {
									...form.schoolYear,
									endDate: LocalDate.parse(e.target.value)
								}})}
							/>
						</Form.Group>
					</Col>
					
					<Col lg='3' className='d-flex align-items-end'>	
						<Button 
							onClick={() => onSubmit({
								...form,
								orgGuid: orgYear.organizationGuid
							})}
						>
							Submit
						</Button>
					</Col>
				</Row>
			</Form>
		</Container>
	)
}

export default (): JSX.Element => {
	const [reportParameters, setReportParameters] = useState<any>({})
	const [reports, setReports] = useState<any>({
		totalActivity: [],
		totalStudentAttendance: [],
		totalFamilyAttendance: [],
		siteSessions: [],
		classSummaries: [],
		programOverviews: [],
		staffSummaries: [],
		studentSurvey: []
	})
	const [isLoading, setIsLoading] = useState<boolean>(false)

	//temp
	const [siteSessions, setSiteSessions] = useState<any[] | null>([])
	const [siteSessionsIsLoading, setSiteSessionsIsLoading] = useState<boolean>(false)

	function handleParameterChange(form): void {
		setReportParameters(form)

		setIsLoading(true)
		getReportsAsync(form.schoolYear.startDate, form.schoolYear.endDate, form.orgGuid)
			.then(res => {
				setReports(res)
			})
			.catch(err => {
				setReports(null)
			})
			.finally(() => {
				setIsLoading(false)
			})

			getSiteSessions(form.schoolYear?.startDate, form.schoolYear?.endDate, form.orgGuid)
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

	return (
		<Container style={{minWidth: '90vw'}}>
			<ParamSelection onSubmit={(form) => handleParameterChange(form)}/>

			<hr />

			<Row>
				<Tab.Container defaultActiveKey='student-attendance'>
					<Row >
						<Col className='p-0' style={{maxWidth: '15rem'}}>
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
											Staffing ({reports.staffSummaries.length})
										</Nav.Link>
									</Nav.Item>

									<Nav.Item>
										<Nav.Link eventKey='student-survey'>
											Student Surveys ({reports.studentSurvey.length})
										</Nav.Link>
									</Nav.Item>
								</Nav>
							</Row>

						</Col>

						<Col className='ms-3'>
							<Tab.Content>

								<Tab.Pane eventKey='student-attendance'>
									<StudentAttendance
										studentAttendanceReport={reports?.totalStudentAttendance}
										reportIsLoading={isLoading}
										parameters={...reportParameters}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='family-attendance'>
									<FamilyAttendance
										familyAttendanceReport={reports?.totalFamilyAttendance}
										reportIsLoading={isLoading}
									 	parameters={{...reportParameters}} 
									 />
								</Tab.Pane>

								<Tab.Pane eventKey='activities'>
									<Activities 
										activityReport={reports?.totalActivity}
										reportIsLoading={isLoading}
										parameters={{...reportParameters}} 
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='site-sessions'>
									<SiteSessions 
										siteSessionsReport={siteSessions}
										reportIsLoading={siteSessionsIsLoading}
										parameters={{...reportParameters}} 
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='summary-of-classes'>
									<SummaryOfClasses 
										summaryOfClassesReport={reports?.classSummaries}
										reportIsLoading={isLoading}
										parameters={{...reportParameters}} 
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='program-overview'>
									<ProgramOverview 
										programOverviewReport={reports?.programOverviews}
										reportIsLoading={isLoading}
										parameters={{...reportParameters}} 
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='staffing'>
									<StaffingSummary 
										staffSummaryReport={reports?.staffSummaries}
										reportIsLoading={isLoading}
										parameters={{...reportParameters}}
									/>
								</Tab.Pane>

								<Tab.Pane eventKey='student-survey'>
									<StudentSurvey
										studentSurveyReport={reports?.studentSurvey}
										reportIsLoading={isLoading}
									 	parameters={{...reportParameters}}
									 />
								</Tab.Pane>

							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</Row>
			
		</Container>
	)
}

/*
<Tab.Pane eventKey='family-attendance'>
									<FamilyAttendance parameters={{...reportParameters}} />
								</Tab.Pane>

								<Tab.Pane eventKey='activities'>
									<Activities parameters={{...reportParameters}} />
								</Tab.Pane>

								<Tab.Pane eventKey='site-sessions'>
									<SiteSessions parameters={{...reportParameters}} />
								</Tab.Pane>

								<Tab.Pane eventKey='summary-of-classes'>
									<SummaryOfClasses parameters={{...reportParameters}} />
								</Tab.Pane>

								<Tab.Pane eventKey='program-overview'>
									<ProgramOverview parameters={{...reportParameters}} />
								</Tab.Pane>

								<Tab.Pane eventKey='staffing'>
									<StaffingSummary parameters={{...reportParameters}}/>
								</Tab.Pane>

								<Tab.Pane eventKey='student-survey'>
									<StudentSurvey parameters={{...reportParameters}}/>
								</Tab.Pane>
*/

/*
We need:
		Total student attendance: List of students with matric number, last name, first name, grade, total days, total hours
		Similar for adult family member attendance

		Total Activity by site
		Table of activity types, the number of distinct participants, and the total hours

		Site sessions
		ask about what she means here

		Summary of Classes
		report sorted by dates, sites
		by session with basic info, total weeks to date, avg hours per session, days of week it was fofered, and average attendance

		Program Overview
		Number of regular attendees to date?, number of days student sessions were offered, number of adult family members to date, avg student attend hours per week, avg student attend days per week

		Staffing
		Instructor statuses

		Student Surveys
		matric, first, last, grade, activity type, days, hours - I'd rather make something more intersting than multiple rows for students for each activity type.

*/