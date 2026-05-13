import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { ReportParameters } from '../ReportParameters'
import { cclc10Fields } from '../Definitions/CSV'
import ReportComponent from '../ReportComponent'
import { Button } from '@/components/ui/button'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	isActive: boolean
}

interface FamilySessionRow {
	site: string;
	firstName: string;
	lastName: string;
	matricNumber: string;
	grade: string;
	familyMember: string;
	sessionName: string;
	sessionType: string;
	sessionDate: string;
	totalTime: string
}

export default ({params, dateDisplay, fileOrgName, isActive}: Props) => {
	const [runRequested, setRunRequested] = useState(false)
	const hasParams = !!params?.startDate && !!params?.endDate

	useEffect(() => {
		setRunRequested(false)
	}, [params.startDate, params.endDate])

	const { isPending, isFetching, data, error, refetch } = useQuery<FamilySessionRow[]>({
		queryKey: [`report/family-session?startDateStr=${params.startDate}&endDateStr=${params.endDate}`],
		enabled: runRequested && hasParams,
		staleTime: Infinity,
		retry: false
	})

	if (!isActive)
		return null;

	if (!runRequested) {
		return (
			<div className='m-1'>
				<Button
					onClick={() => setRunRequested(true)}
					disabled={!hasParams}
				>
					Run Family Session Report
				</Button>
				{!hasParams && (
					<p className='text-sm text-gray-500 mt-1'>
						Select a start and end date above first.
					</p>
				)}
			</div>
		)
	}

	return (
		<>
			<ReportComponent
				isLoading={isPending || isFetching}
				hasError={!!error}
				displayName={`Family Session Report for all Organizations, ${dateDisplay}`}
				fileData={data}
				fileName={`Family_Session_Grant_Tracker`}
				fileFields={cclc10Fields}
				showHeader={true}
			>
				<div>
					For Download Only
				</div>
			</ReportComponent>
			{error && !isFetching && (
				<Button className='m-1' onClick={() => refetch()}>
					Try Again
				</Button>
			)}
		</>
	)
}