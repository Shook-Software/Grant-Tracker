import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Col, Row, Form } from 'react-bootstrap'

import Table, { SortDirection } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'
import { ReportParameters } from '../ReportParameters'
import { staffingFields, flattenStaffing } from '../Definitions/CSV'
import { staffingColumns } from '../Definitions/Columns'
import ReportComponent from '../ReportComponent'

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, onRowCountChange}: Props) => {
	
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/staffSummary?yearGuid=${params?.year?.guid}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity
	  })
	  
	const [staffingStatusFilter, setStatusTypeFilter] = useState<string>('')
	const [staffingDropdownOptions, setStaffingDropdownOptions] = useState<any[] | null>([])

	useEffect(() => {
		if (Array.isArray(report) && report.length > 0) {
			setStatusTypeFilter(report[0].status)
			onRowCountChange(report.length)
			
			let options = [
				{
					guid: 'all',
					label: `All (${report.reduce((total, current) => total + current.instructors.length, 0)})`
				},
				...report.map(statusGroup => ({
					guid: statusGroup.status,
					label: `${statusGroup.status} (${statusGroup.instructors.length})`
				}))
			]

			setStaffingDropdownOptions(options)
		}
	}, [report])
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayData={report}
			displayName={`Staffing for ${params.organizationName}, ${dateDisplay}`}
			fileData={report}
			fileName={`Staffing_${fileOrgName}_${fileDate}`}
			fileFields={staffingFields}
		> 
			<Row class='d-flex flex-row'>
				<Row>
					<Form.Group className='mb-3'>
						<Form.Label>Staff Status Type</Form.Label>
						<Dropdown  
							value={staffingStatusFilter}
							options={staffingDropdownOptions}
							onChange={(status: string) => setStatusTypeFilter(status)}
						/>
					</Form.Group>
				</Row>

				<Row>
					<Table 
						className='m-0'
						columns={staffingColumns} 
						dataset={report?.find(statusGroup => statusGroup.status === staffingStatusFilter)?.instructors} 
						defaultSort={{index: 0, direction: SortDirection.Ascending}}
						maxHeight='45rem'
						tableProps={{
							size: 'sm'
						}}
					/>
				</Row>
			</Row>
		</ReportComponent>
	)
}