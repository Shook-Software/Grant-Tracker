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
import { Bar, Line } from "react-chartjs-2"
import { Chart, ChartData, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, CategoryScale, BarElement} from "chart.js"
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale, ChartDataLabels); 


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

interface RegularAttendeeByDateDTO {
	dateOfRegularAttendance: DateOnly
}

interface AttendanceGoalAggregateDTO {
	startDate: LocalDate
	endDate: LocalDate
	lastAttendanceEntryDate: DateOnly
	regularAttendeesByDates: RegularAttendeeByDateDTO[]
	goal: number
}

interface StudentDaysDTO {
	organizationGuid: string
	studentGuid: string
	daysAttended: number
}

function groupStudentAttendanceDaysIntoBuckets(studentDays: StudentDaysDTO[]) {
	return studentDays.reduce((dayRange, student) => {
		if (student.daysAttended >= 1)
			dayRange[0]++;
		if (student.daysAttended <= 10)
			dayRange[1]++;
		else if (student.daysAttended <= 20)
			dayRange[2]++;
		else if (student.daysAttended < 30)
			dayRange[3]++;
		else
			dayRange[4]++;

		return dayRange;
	}, [0, 0, 0, 0, 0])

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

	const { data: attendanceGoalAggregate } = useQuery<AttendanceGoalAggregateDTO>({ 
		queryKey: [`organization/${orgYear?.organization.guid}/regularAttendeeTimeline?dateStr=${(LocalDate.now().toString())}`],
		select: (agg) => ({
			...agg, 
			startDate: DateOnly.toLocalDate(agg.startDate as unknown as DateOnly), 
			endDate: DateOnly.toLocalDate(agg.endDate as unknown as DateOnly)
		}),
		retry: false,
		staleTime: Infinity
	})

	const { data: studentAttendanceDayCounts } = useQuery({ 
		queryKey: [`organization/${orgYear?.organization.guid}/studentAttendanceDays?dateStr=${(LocalDate.now().toString())}`],
		retry: false,
		staleTime: Infinity,
		select: groupStudentAttendanceDaysIntoBuckets
	})

	if (loadingAttendIssues || loadingSessionIssues)
		return <Spinner />

	const timeOfDay: string = LocalTime.now().hour() > 11 
		? LocalTime.now().hour() > 17 ? 'evening' : 'afternoon'
		: 'morning'

	const lineData = attendanceGoalAggregate?.regularAttendeesByDates.map((attendeeDate, idx) => ({
		x: new Date(attendeeDate.dateOfRegularAttendance.year, attendeeDate.dateOfRegularAttendance.month - 1, attendeeDate.dateOfRegularAttendance.day),
		y: idx + 1
	}))

	const lineDataset: ChartData<"line"> | undefined = lineData && lineData.length > 0 ? {
		labels: lineData?.map(x => x.x),
		datasets: [
			{
				label: 'Regular Attendee Count',
				data: lineData!.map(x => x.y),
				borderColor: '#C43138',
				pointRadius: 0
			}
		]
	} : undefined

	
	const barDataset: ChartData<"bar"> | undefined = studentAttendanceDayCounts ? {
		labels: ['>=1 Day', '1-10 Days', '11-20 Days', '21-29 Days', '30+ Days'],
		datasets: [
			{
				label: 'Student Count',
				data: studentAttendanceDayCounts,
				backgroundColor: '#C43138',
			}
		]
	} : undefined

	const showReports: boolean = !!lineDataset || !!barDataset

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

			<hr />

			<div className='row mt-3'>
				{showReports ? <h5>Statistics:</h5> : null}
				{showReports ? <div>Reporting Period: <span className='fw-bold'>{attendanceGoalAggregate!.startDate.toString()}</span> to <span className='fw-bold'>{attendanceGoalAggregate!.endDate.toString()}</span></div> : null}
				{showReports ? <div>Goal: {attendanceGoalAggregate!.goal} Regular Attendees - <span className={attendanceGoalAggregate!.regularAttendeesByDates.length >= attendanceGoalAggregate!.goal ? 'text-success' : ''}>{(attendanceGoalAggregate!.regularAttendeesByDates.length / attendanceGoalAggregate!.goal).toFixed(0)}%</span></div> : null}
			</div>

			<div className='row mt-1'>	 
					{lineDataset ?
						<section className='col-sm-6 col-12'>
							<Line 
								data={lineDataset}
								options={{
									plugins: {
										title: {
											display: true,
											text: 'Regular Attendee Count YTD'
										},
										legend: {
											display: true,
										},
										datalabels: {
											display: false
										}
									},
									scales: {
										x: {
											type: 'time',
											min: `${attendanceGoalAggregate?.startDate.year}-${attendanceGoalAggregate?.startDate.month}-${attendanceGoalAggregate?.startDate.day}`,
											max: `${attendanceGoalAggregate?.endDate.year}-${attendanceGoalAggregate?.endDate.month}-${attendanceGoalAggregate?.endDate.day}`,
											ticks: {
												autoSkip: false
											}
										}
									}
								}}
							/>
						</section>	
					: null}

					{barDataset ?
						<section className='col-sm-6 col-12'>
							<Bar 
								data={barDataset}
								options={{
									plugins: {
										title: {
											display: true,
											text: 'Student Attendence by Range of Days Attended'
										},
										legend: {
											display: true,
										},
										datalabels: {
											anchor: 'end', // Position of the labels
											align: 'end', // Align labels with the bars
											color: 'black', // Text color
											font: {
											size: 12,
											weight: 'bold',
											},
										},
									}
								}}
							/>
						</section>
					: null}
			</div>

			<hr className={showReports ? '' : 'd-none'} />
		</main>
	)
}

/*

*/


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