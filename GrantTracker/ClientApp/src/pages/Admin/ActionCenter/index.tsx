import { useQuery } from "@tanstack/react-query"
import { ReactElement, useContext } from "react"
import { OrgYearContext } from ".."
import { DateOnly } from "Models/DateOnly"
import { DateTimeFormatter, LocalDate, LocalTime } from "@js-joda/core"
import Table, { Column } from "components/BTable"
import { Link, useNavigate } from "react-router-dom"
import { Locale } from "@js-joda/locale_en-us"

import paths from 'utils/routing/paths'
import { Spinner } from "react-bootstrap"


enum AttendanceIssue {
	Conflict = 0,
	Malformed = 1
}

interface AttendanceIssueDomain {
	attendanceGuid: string
	sessionGuid: string
	instanceDate: DateOnly
	sessionName: string
	type: AttendanceIssue
	message: string
}

interface AttendanceIssueDTO {
	attendanceGuid: string
	sessionGuid: string
	instanceDate: LocalDate
	sessionName: string
	type: AttendanceIssue
	message: string
}

const sessionIssueTitle = (issue: SessionIssue) => {
	if (issue == SessionIssue.Schedule)
		return "Schedule"
	else if (issue == SessionIssue.Registrations)
		return "Registrations"
}

enum SessionIssue {
	Schedule = 0,
	Registrations = 1
}

interface IssueDTO<T> {
	type: T
	message: string
}

interface SessionIssuesDTO {
	sessionGuid: string
	name: string
	issues: IssueDTO<SessionIssue>[] 
}

export default ({}): ReactElement => {
    const { orgYear } = useContext(OrgYearContext)
	const navigate = useNavigate()

	const { isPending: loadingAttendIssues, data: attendIssues, error: attendError } = useQuery<AttendanceIssueDTO[]>({ 
		queryKey: [`organization/${orgYear?.organization.guid}/attendance/issues`],
		select: (issues: AttendanceIssueDomain[]) => issues.map(issue => ({...issue, instanceDate: DateOnly.toLocalDate(issue.instanceDate)})),
		retry: false,
		staleTime: Infinity
	})

	const { isPending: loadingSessionIssues, data: sessionIssues, error: sessionsError } = useQuery<SessionIssuesDTO[]>({ 
		queryKey: [`organizationYear/${orgYear?.guid}/session/issues`],
		retry: false,
		staleTime: Infinity
	})

	if (loadingAttendIssues || loadingSessionIssues)
		return <Spinner />

	const timeOfDay: string = LocalTime.now().hour() > 11 
		? LocalTime.now().hour() > 17 ? 'evening' : 'afternoon'
		: 'morning'

	return (
		<main className='mt-3'>
			<div className='row'>
				<h4>Overview for {orgYear?.organization.name}</h4>
				<small>Good {timeOfDay}! This page will serve as an action center for your organization.</small> <br />
				<small>We'll be expanding this page in the future, but until then please note and rectify any attendance issues as soon as possible.</small>
			</div>
			<div className='row mt-3'>
				<section className='col-sm-6 col-12'>
					<h5>Attendance Issues</h5>
					{attendIssues.length === 0 
						? 'No attendance issues found, you\'re good to go!'
						: <>
							<small>Click on a row to be taken to edit the record.</small>
							<Table columns={attendanceIssueColumns} dataset={attendIssues} rowProps={{onClick: (e, issue: AttendanceIssue) => navigate(`${paths.Admin.Attendance.path}?session=${issue.sessionGuid}&attendanceId=${issue.attendanceGuid}`)}} size='sm' />
						</>
					}
				</section>

				<section className='col-sm-6 col-12'>
					<h5>Attendance Issues</h5>
					{sessionIssues.length === 0 
						? 'No session issues found, you\'re good to go!'
						: <>
							<small>Click on a row to be taken to edit the session.</small>
							<Table columns={sessionIssueColumns} dataset={sessionIssues} rowProps={{onClick: (e, session: SessionIssuesDTO) => navigate(`/home/admin/sessions/${session.sessionGuid}`)}} size='sm' />
						</>
					}
				</section>
			</div>
		</main>
	)
}


const sessionIssueColumns: Column[] = [
	{
		label: 'Session',
		attributeKey: 'name',
		sortable: true
	},
	{
		label: 'Issue',
		attributeKey: 'issues',
		sortable: false,
		transform: (issues: IssueDTO<SessionIssue>[]) => (
			<div className='d-flex flex-column'>
				{issues.map(issue => (
					<div>
						{sessionIssueTitle(issue.type)} Issue - {issue.message}
					</div>
				))}
			</div>
		)
	}
]

const attendanceIssueColumns: Column[] = [
	{
		label: 'Session',
		attributeKey: 'sessionName',
		sortable: true
	},
	{
		label: 'Date',
		attributeKey: 'instanceDate',
		sortable: true,
		transform: (date: LocalDate) => date.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))
	}
]