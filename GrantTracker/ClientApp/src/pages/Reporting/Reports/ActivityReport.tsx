import { useQuery } from '@tanstack/react-query'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { activityFields } from '../Definitions/CSV'
import { activityReportColumns } from '../Definitions/Columns'
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
		queryKey: [ `report/totalActivity?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
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
			displayName={`Total Activity for ${params.organizationName}, ${dateDisplay}`}
			fileData={report}
			fileName={`Total_Activity_${fileOrgName}_${fileDate}`}
			fileFields={activityFields}
		> 
			<Row>
				<Table 
					className='m-0'
					columns={activityReportColumns} 
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