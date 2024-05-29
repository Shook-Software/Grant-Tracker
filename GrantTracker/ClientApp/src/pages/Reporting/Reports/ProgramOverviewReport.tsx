import { useQuery } from '@tanstack/react-query'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { programOverviewFields } from '../Definitions/CSV'
import { programOverviewColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'
import { useEffect } from 'react'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/programOverview?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayData={report}
			displayName={`Program Overview for ${params.organizationName}, ${dateDisplay}`}
			fileData={report}
			fileName={`Program_Overview_${fileOrgName}_${fileDate}`}
			fileFields={programOverviewFields}
		> 
			<Row>
				<Table 
					className='m-0'
					columns={programOverviewColumns} 
					dataset={report}
					defaultSort={{index: 0, direction: SortDirection.Ascending}}
					maxHeight='45rem'
					tableProps={{
					  size: 'sm'
					}}
				/>
			</Row>
		</ReportComponent>
	)
}