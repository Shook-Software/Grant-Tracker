import { useQuery } from '@tanstack/react-query'
import { Row } from 'react-bootstrap'

import Table, { Column, SortDirection } from 'components/BTable'
import ReportComponent from '../ReportComponent'
import { Quarter } from 'Models/OrganizationYear'

interface Props {
}

export default ({}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/all-staff` ],
		retry: false,
		staleTime: Infinity
	  })
	
	return (
		<ReportComponent
			isLoading={isPending}
			displayName='All Staff, All Years'
			displayData={report}
			fileData={report?.map(row => ({...row, quarter: Quarter[row.quarter]})) || []}
			fileName='All_Staff'
			fileFields={fields}
		> 
			<Row>
				<Table 
					className='m-0'
					columns={columns} 
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

const columns: Column[] = [
	{
		label: 'Organization',
		attributeKey: 'organizationName',
		sortable: true
	},
	{
		label: 'SchoolYear',
		attributeKey: 'schoolYear',
		sortable: true
	},
	{
		label: 'Quarter',
		attributeKey: 'quarter',
		transform: (quarter: number) => Quarter[quarter],
		sortable: true
	},
	{
		label: 'ID',
		attributeKey: 'badgeNumber',
		sortable: true
	},
	{
		label: 'Status',
		attributeKey: 'status',
		sortable: true
	},
	{
		label: 'Last Name',
		attributeKey: 'lastName',
		sortable: true
	},
	{
		label: 'First Name',
		attributeKey: 'firstName',
		sortable: true
	}
]

const fields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'SchoolYear',
		value: 'schoolYear'
	},
	{
		label: 'Quarter',
		value: 'quarter'
	},
	{
		label: 'ID',
		value: 'badgeNumber'
	},
	{
		label: 'Status',
		value: 'status'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
]