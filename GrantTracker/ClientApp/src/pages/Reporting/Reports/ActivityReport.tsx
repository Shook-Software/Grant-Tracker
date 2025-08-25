import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"

import { ReportParameters } from '../ReportParameters'
import { activityFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ActivityReportData {
	activity: string
	totalAttendees: number
	totalHours: number
}

const columns: ColumnDef<ActivityReportData, any>[] = [
	{
		accessorKey: "activity",
		header: ({ column }) => (
			<HeaderCell 
				label="Activity Type" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		id: 'activity'
	},
	{
		accessorKey: "totalAttendees",
		header: ({ column }) => (
			<HeaderCell 
				label="Total Attendees" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		cell: ({ row }) => (
			<div className='text-center'>{row.getValue("totalAttendees")}</div>
		),
		id: 'totalAttendees'
	},
	{
		accessorKey: "totalHours",
		header: ({ column }) => (
			<HeaderCell 
				label="Total Hours" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		cell: ({ row }) => (
			<div className='text-center'>{Math.floor((row.getValue("totalHours") as number) * 100) / 100}</div>
		),
		id: 'totalHours'
	}
]

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	isActive: boolean
	onRowCountChange: (rows: number) => void
}


export default ({params, dateDisplay, fileOrgName, fileDate, isActive, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/totalActivity?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  });

	useEffect(() => {
		onRowCountChange(report?.length || 0)
	}, [report])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="col-span-12 max-h-[45rem] overflow-auto relative">
				<DataTable 
					columns={columns}
					data={report || []}
					initialSorting={[{ id: 'activity', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto w-auto self-start"
					title={`Total Activity for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(values, activityFields, `Total_Activity_${fileOrgName}_${fileDate}`)}
								size='sm'
							>
								Save to CSV {values && values.length !== (report.length) ? `(${values.length} filtered rows)` : ''}
							</Button>
						)
					}}
				/>
			</div>
		</ReportComponent>
	)
}