import { useQuery } from '@tanstack/react-query'
import { LocalDate, LocalTime } from '@js-joda/core'

import { TimeOnly } from 'Models/TimeOnly'
import { DateOnly } from 'Models/DateOnly'

import { ReportParameters } from '../ReportParameters'
import { scheduleFields } from '../Definitions/CSV'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
}

interface ScheduleRow {
	className: string
	activity: string
	objective: string
	sessionType: string
	dayOfWeek: string
	startTime: LocalTime
	endTime: LocalTime
	startDate: LocalDate
	endDate: LocalDate
	firstName: string
	lastName: string
}

export default ({params, dateDisplay, fileOrgName, fileDate}: Props) => {
	const { isPending, data, error } = useQuery<ScheduleRow[]>({
		queryKey: [`report/schedule?yearGuid=${params?.year?.guid}&organizationGuid=${params?.organizationGuid}`],
		enabled: !!params?.startDate && !!params?.endDate,
		select: (rows: any[]) => rows.map(row => ({
			...row,
			startDate: DateOnly.toLocalDate(row.startDate),
			endDate: DateOnly.toLocalDate(row.endDate),
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
			displayName={`Schedule Report for ${params.organizationName}, ${dateDisplay}`}
			fileData={data}
			fileName={`${fileOrgName}_Semester_Schedule_${fileDate}`}
			fileFields={scheduleFields}
		>
			<div>
				For Download Only
			</div>
		</ReportComponent>
	)
}