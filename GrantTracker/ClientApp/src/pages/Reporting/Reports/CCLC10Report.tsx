import { useQuery } from '@tanstack/react-query'
import { LocalDate, LocalTime } from '@js-joda/core'

import { TimeOnly } from 'Models/TimeOnly'
import { DateOnly } from 'Models/DateOnly'

import { ReportParameters } from '../ReportParameters'
import { cclc10Fields } from '../Definitions/CSV'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
}

interface CCLC10Row {
	school: string
	matricNumber: string
	grade: string
	lastName: string
	firstName: string
	session: string
	date: LocalDate
	startTime: LocalTime
	endTime: LocalTime
	activity: string
}

export default ({params, dateDisplay, fileOrgName}: Props) => {
	const { isPending, data, error } = useQuery<CCLC10Row[]>({
		queryKey: [`report/CCLC10?startDateStr=${params.startDate}&endDateStr=${params.endDate}`],
		enabled: !!params?.startDate && !!params?.endDate,
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
			displayName={`GT CCLC10 Report for all Organizations, ${dateDisplay}`}
			fileData={data}
			fileName={`GT_CCLC10_Grant_Tracker_${fileOrgName}`}
			fileFields={cclc10Fields}
		>
			<div>
				For Download Only
			</div>
		</ReportComponent>
	)
}