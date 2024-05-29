import { useQuery } from '@tanstack/react-query'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { siteSessionFields, flattenSiteSessions } from '../Definitions/CSV'
import { siteSessionsColumns } from '../Definitions/Columns'
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
		queryKey: [ `report/siteSessions?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
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
			displayName={`Site Sessions for ${params.organizationName}, ${dateDisplay}`}
			fileData={flattenSiteSessions(report)}
			fileName={`Site_Sessions_${fileOrgName}_${fileDate}`}
			fileFields={siteSessionFields}
		> 
			<Row>
				<Table 
					className='m-0'
					columns={siteSessionsColumns} 
					dataset={report} 
					defaultSort={{index: 1, direction: SortDirection.Ascending}}
					maxHeight='45rem'
					tableProps={{
						size: 'sm',
						style: {
						overflowY: 'scroll',
						overflowX: 'visible'
						}
					}}
				/>
			</Row>
		</ReportComponent>
	)
}