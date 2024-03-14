import { useQuery } from "@tanstack/react-query"
import { ReactElement, useContext } from "react"
import { OrgYearContext } from ".."
import { DateOnly } from "Models/DateOnly"
import { DateTimeFormatter, LocalDate } from "@js-joda/core"
import Table, { Column } from "components/BTable"
import { Link } from "react-router-dom"
import { Locale } from "@js-joda/locale_en-us"

import paths from 'utils/routing/paths'
import { Spinner } from "react-bootstrap"

interface AttendanceIssueDomain {
	studentGuid: string
	studentSchoolYearGuid: string
	attendanceGuid: string
	sessionGuid: string
	instanceDate: DateOnly
	sessionName: string
}

interface AttendanceIssue {
	studentGuid: string
	studentSchoolYearGuid: string
	attendanceGuid: string
	sessionGuid: string
	instanceDate: LocalDate
	sessionName: string
}

export default ({}): ReactElement => {
    const { orgYear } = useContext(OrgYearContext)

	const { isPending: loadingAttendIssues, data: attendIssues, error: dateError } = useQuery({ 
		queryKey: [`organization/${orgYear?.organization.guid}/attendance/issues`],
		select: (issues: AttendanceIssueDomain[]) => issues.map(issue => ({...issue, instanceDate: DateOnly.toLocalDate(issue.instanceDate)})),
		retry: false,
		staleTime: Infinity
	})

	if (loadingAttendIssues)
		return <Spinner />

	return (
		<div>
			<Table columns={attendanceIssueColumns} dataset={attendIssues} />
		</div>
	)
}


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
	},
	{
		label: '',
		attributeKey: '',
		sortable: false,
		transform: (issue: AttendanceIssue) => <Link to={`${paths.Admin.Attendance.path}?session=${issue.sessionGuid}&attendanceId=${issue.attendanceGuid}` }>Fix</Link>
	}

]