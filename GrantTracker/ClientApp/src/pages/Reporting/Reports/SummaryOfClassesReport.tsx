import { useQuery } from '@tanstack/react-query'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import { ReportParameters } from '../ReportParameters'
import { flattenSummaryOfClasses, summaryOfClassesFields } from '../Definitions/CSV'
import { summaryOfClassesColumns } from '../Definitions/Columns'
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
		queryKey: [ `report/summaryOfClasses?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
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
			displayName={`Summary of Classes for ${params.organizationName}, ${dateDisplay}`}
			fileData={flattenSummaryOfClasses(report)}
			fileName={`Summary_of_Classes_${fileOrgName}_${fileDate}`}
			fileFields={summaryOfClassesFields}
		> 
			<Row>
				<Table 
					className='m-0'
					columns={summaryOfClassesColumns} 
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