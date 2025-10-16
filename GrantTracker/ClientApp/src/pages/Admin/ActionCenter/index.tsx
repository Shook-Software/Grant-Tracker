import { useQuery } from "@tanstack/react-query"
import { ReactElement, useContext } from "react"
import { OrgYearContext } from ".."
import { DateOnly } from "Models/DateOnly"
import { DateTimeFormatter, LocalDate, LocalTime } from "@js-joda/core"
import { DataTable } from "components/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { useNavigate } from "react-router-dom"
import { Locale } from "@js-joda/locale_en-us"

import paths from 'utils/routing/paths'
import { Spinner } from "@/components/ui/Spinner"
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
		retry: false
	})

	const { isPending: loadingSessionIssues, data: sessionIssues, error: sessionsError } = useQuery<SessionIssuesDTO[]>({ 
		queryKey: [`organizationYear/${orgYear?.guid}/session/issues`],
		retry: false
	})

	const { data: attendanceGoalAggregate } = useQuery<AttendanceGoalAggregateDTO>({ 
		queryKey: [`organization/${orgYear?.organization.guid}/regularAttendeeTimeline?dateStr=${(LocalDate.now().toString())}`],
		select: (agg) => ({
			...agg, 
			startDate: DateOnly.toLocalDate(agg.startDate as unknown as DateOnly), 
			endDate: DateOnly.toLocalDate(agg.endDate as unknown as DateOnly)
		}),
		retry: false
	})

	const { data: studentAttendanceDayCounts } = useQuery({ 
		queryKey: [`organization/${orgYear?.organization.guid}/studentAttendanceDays?dateStr=${(LocalDate.now().toString())}`],
		retry: false,
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
		<main className='p-6 max-w-7xl mx-auto'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 mb-3'>Overview for {orgYear?.organization.name}</h1>
				<div className='space-y-2 text-gray-600'>
					<p className='text-lg'>Good {timeOfDay}! This page will serve as an action center for your organization.</p>
					<p className='text-sm'>We'll be expanding this page in the future, but until then please note and rectify any attendance issues as soon as possible.</p>
				</div>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				<section className='bg-white rounded-lg shadow-sm border p-6 space-y-4'>
					<div className='flex items-center justify-between'>
						<h2 className='text-xl font-semibold text-gray-900'>Attendance Issues</h2>
						{attendIssues?.length > 0 && (
							<span className='px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full'>
								{attendIssues.length} issue{attendIssues.length !== 1 ? 's' : ''}
							</span>
						)}
					</div>
					{attendIssues?.length === 0 
						? (
							<div className='flex items-center justify-center py-12'>
								<div className='text-center'>
									<div className='text-green-600 text-4xl mb-3'>✓</div>
									<p className='text-gray-600'>No attendance issues found, you're good to go!</p>
								</div>
							</div>
						)
						: <>
							<p className='text-sm text-gray-600'>Click on a row to be taken to edit the record.</p>
							<DataTable 
								columns={attendanceIssueColumns} 
								data={attendIssues || []} 
								onRowClick={(issue: AttendanceIssueDTO) => navigate(`${paths.Admin.Attendance.path}?session=${issue.sessionGuid}&attendanceId=${issue.attendanceGuid}`)}
								initialSorting={[{ id: 'instanceDate', desc: true }]}
								containerClassName="rounded-lg border-gray-200"
								className="hover:bg-gray-50 cursor-pointer"
								emptyMessage="No attendance issues found"
							/>
						</>
					}
				</section>

				<section className='bg-white rounded-lg shadow-sm border p-6 space-y-4'>
					<div className='flex items-center justify-between'>
						<h2 className='text-xl font-semibold text-gray-900'>Session Issues</h2>
						{sessionIssues?.length > 0 && (
							<span className='px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full'>
								{sessionIssues.length} issue{sessionIssues.length !== 1 ? 's' : ''}
							</span>
						)}
					</div>
					{sessionIssues?.length === 0 
						? (
							<div className='flex items-center justify-center py-12'>
								<div className='text-center'>
									<div className='text-green-600 text-4xl mb-3'>✓</div>
									<p className='text-gray-600'>No session issues found, you're good to go!</p>
								</div>
							</div>
						)
						: <>
							<p className='text-sm text-gray-600'>Click on a row to be taken to edit the session.</p>
							<DataTable 
								columns={sessionIssueColumns} 
								data={sessionIssues || []} 
								onRowClick={(session: SessionIssuesDTO) => navigate(`/home/admin/sessions/${session.sessionGuid}`)}
								initialSorting={[{ id: 'name', desc: false }]}
								containerClassName="rounded-lg border-gray-200"
								className="hover:bg-gray-50 cursor-pointer"
								emptyMessage="No session issues found"
							/>
						</>
					}
				</section>
			</div>

			{showReports && (
				<>
					<hr className='my-8 border-gray-200' />
					
					<div className='bg-white rounded-lg shadow-sm border p-6 space-y-4'>
						<h2 className='text-2xl font-semibold text-gray-900'>Statistics</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<p className='text-sm font-medium text-gray-500'>Reporting Period</p>
								<p className='text-lg font-semibold'>{attendanceGoalAggregate!.startDate.toString()} to {attendanceGoalAggregate!.endDate.toString()}</p>
							</div>
							<div className='space-y-2'>
								<p className='text-sm font-medium text-gray-500'>Goal Progress</p>
								<p className='text-lg font-semibold'>
									{attendanceGoalAggregate!.goal} Regular Attendees - 
									<span className={attendanceGoalAggregate!.regularAttendeesByDates.length >= attendanceGoalAggregate!.goal ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
										{Math.min((attendanceGoalAggregate!.regularAttendeesByDates.length / attendanceGoalAggregate!.goal * 100), 100).toFixed(0)}%
									</span>
								</p>
								<div className='w-full bg-gray-200 rounded-full h-2'>
									<div 
										className={`h-2 rounded-full transition-all duration-300 ${attendanceGoalAggregate!.regularAttendeesByDates.length >= attendanceGoalAggregate!.goal ? 'bg-green-600' : 'bg-red-600'}`}
										style={{ width: `${Math.min((attendanceGoalAggregate!.regularAttendeesByDates.length / attendanceGoalAggregate!.goal * 100), 100)}%` }}
									></div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{showReports && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>	 
					{lineDataset && (
						<div className='bg-white rounded-lg shadow-sm border p-6'>
							<h3 className='text-lg font-semibold text-gray-900 mb-4'>Regular Attendee Count YTD</h3>
							<Line 
								data={lineDataset}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										title: {
											display: false
										},
										legend: {
											display: false
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
								height={300}
							/>
						</div>
					)}

					{barDataset && (
						<div className='bg-white rounded-lg shadow-sm border p-6'>
							<h3 className='text-lg font-semibold text-gray-900 mb-4'>Student Attendance by Range of Days</h3>
							<Bar 
								data={barDataset}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										title: {
											display: false
										},
										legend: {
											display: false
										},
										datalabels: {
											anchor: 'end',
											align: 'end',
											color: 'black',
											font: {
												size: 12,
												weight: 'bold',
											},
										},
									}
								}}
								height={300}
							/>
						</div>
					)}
				</div>
			)}

			<hr className={showReports ? 'my-6 border-gray-200' : 'hidden'} />
		</main>
	)
}

/*

*/


const sessionIssueColumns: ColumnDef<SessionIssuesDTO, any>[] = [
	{
		header: ({ column }) => (
			<HeaderCell 
				label="Session" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value)}
				filterPlaceholder="Filter sessions..."
			/>
		),
		accessorKey: 'name',
		cell: ({ row }) => row.original.name,
		filterFn: (row, id, value) => {
			const name = row.getValue(id) as string
			return name?.toLowerCase().includes(value.toLowerCase()) || false
		}
	},
	{
		header: () => <HeaderCell label="Issue" />,
		accessorKey: 'issues',
		enableSorting: false,
		cell: ({ row }) => {
			const issues = row.original.issues
			return (
				<div className='flex flex-col space-y-1'>
					{issues.map((issue, idx) => (
						<div key={idx} className='text-sm'>
							{sessionIssueTitle(issue.type)} Issue - {issue.message}
						</div>
					))}
				</div>
			)
		}
	}
]

const attendanceIssueColumns: ColumnDef<AttendanceIssueDTO, any>[] = [
	{
		header: ({ column }) => (
			<HeaderCell 
				label="Session" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value)}
				filterPlaceholder="Filter sessions..."
			/>
		),
		accessorKey: 'sessionName',
		cell: ({ row }) => row.original.sessionName,
		filterFn: (row, id, value) => {
			const sessionName = row.getValue(id) as string
			return sessionName?.toLowerCase().includes(value.toLowerCase()) || false
		}
	},
	{
		header: ({ column }) => (
			<HeaderCell 
				label="Date" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		accessorKey: 'instanceDate',
		cell: ({ row }) => {
			const date = row.original.instanceDate
			return date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, yyyy').withLocale(Locale.ENGLISH))
		},
		enableSorting: false
	}
]