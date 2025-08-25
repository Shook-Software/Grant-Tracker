import * as React from "react"
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { siteSessionFields, flattenSiteSessions } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { DateOnly } from 'Models/DateOnly'
import { Button } from "@/components/ui/button"

interface SiteSessionData {
	sessionName: string
	instanceDate: any
	activityType: string
	objectives: string[]
	sessionType: string
	fundingSource: string
	partnershipType: string
	organizationType: string
	attendeeCount: number
	grades: string
	instructors: {
		firstName: string
		lastName: string
	}[]
}

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
		queryKey: [ `report/siteSessions?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])

	const activityTypeOptions = useMemo(() => [...new Set(report?.map(r => r.activityType).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const sessionTypeOptions = useMemo(() => [...new Set(report?.map(r => r.sessionType).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const fundingSourceOptions = useMemo(() => [...new Set(report?.map(r => r.fundingSource).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const partnershipTypeOptions = useMemo(() => [...new Set(report?.map(r => r.partnershipType).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const organizationTypeOptions = useMemo(() => [...new Set(report?.map(r => r.organizationType).filter(Boolean))].map(v => ({ value: v, label: v })), [report])

	const siteSessionsColumns = useMemo<ColumnDef<SiteSessionData, any>[]>(() => [
		{
			accessorKey: "sessionName",
			header: ({ column }) => (
				<HeaderCell 
					label="Name" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search names..."
				/>
			),
			filterFn: (row, id, value) => {
				const sessionName = row.getValue(id) as string
				return sessionName?.toLowerCase().includes(value.toLowerCase()) || false
			},
			id: 'sessionName'
		},
		{
			accessorKey: "instanceDate",
			header: ({ column }) => (
				<HeaderCell 
					label="Instance Date" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
				/>
			),
			cell: ({ row }) => {
				const date = row.getValue("instanceDate")
				return DateOnly.toLocalDate(date).toString()
			},
			id: 'instanceDate'
		},
		{
			accessorKey: "activityType",
			header: ({ column }) => (
				<HeaderCell 
					label="Activity Type" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={activityTypeOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'activityType'
		},
		{
			accessorKey: "objectives",
			header: () => <HeaderCell label="Objective" />,
			cell: ({ row }) => {
				const objectives = row.getValue("objectives") as string[]
				return (
					<div className='flex flex-col'>
						{objectives?.map((objective, index) => (
							<div key={index}>{objective}</div>
						))}
					</div>
				)
			},
			id: 'objectives'
		},
		{
			accessorKey: "sessionType",
			header: ({ column }) => (
				<HeaderCell 
					label="Session Type" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={sessionTypeOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'sessionType'
		},
		{
			accessorKey: "fundingSource",
			header: ({ column }) => (
				<HeaderCell 
					label="Funding Source" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={fundingSourceOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'fundingSource'
		},
		{
			accessorKey: "partnershipType",
			header: ({ column }) => (
				<HeaderCell 
					label="Partnership Type" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={partnershipTypeOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'partnershipType'
		},
		{
			accessorKey: "organizationType",
			header: ({ column }) => (
				<HeaderCell 
					label="Organization Type" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterOptions={organizationTypeOptions}
					filterValue={column.getFilterValue() as string}
					onFilterSelect={(value) => column.setFilterValue(value)}
				/>
			),
			filterFn: (row, id, value) => {
				if (!value) return true
				return row.getValue(id) === value
			},
			id: 'organizationType'
		},
		{
			accessorKey: "attendeeCount",
			header: ({ column }) => (
				<HeaderCell 
					label="Attendee Count" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min count..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("attendeeCount")}</div>
			),
			id: 'attendeeCount'
		},
		{
			accessorKey: "grades",
			header: () => <HeaderCell label="Grades" />,
			cell: ({ row }) => {
				const grades = row.getValue("grades") as string
				const displayGrades = grades === '{}' || grades === '{ }' ? 'N/A' : grades.substring(1, grades.length - 1)
				return <div className='text-center'>{displayGrades}</div>
			},
			id: 'grades'
		},
		{
			accessorKey: "instructors",
			header: () => <HeaderCell label="Instructors" />,
			cell: ({ row }) => {
				const instructors = row.getValue("instructors") as SiteSessionData['instructors']
				return (
					<div style={{minWidth: 'fit-content'}}>
						{instructors?.map((instructor, index) => (
							<React.Fragment key={index}>
								<p className='my-0 px-3' style={{minWidth: 'fit-content'}}>
									{instructor.firstName && instructor.lastName ? `${instructor.firstName} ${instructor.lastName}` : 'N/A'}
								</p>
								{index === instructors.length - 1 ? null : <hr className='m-1'/>}
							</React.Fragment>
						))}
					</div>
				)
			},
			id: 'instructors'
		}
	], [activityTypeOptions, sessionTypeOptions, fundingSourceOptions, partnershipTypeOptions, organizationTypeOptions])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={siteSessionsColumns}
					data={report || []}
					initialSorting={[{ id: 'instanceDate', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Site Sessions for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						const flattened = flattenSiteSessions(values)
						
						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattened, siteSessionFields, `Site_Sessions_${fileOrgName}_${fileDate}`)}
								size='sm'
							>
								Save to CSV {flattened && values.length !== (report.length) ? `(${flattened.length} filtered rows)` : ''}
							</Button>
						)
					}}
				/>
			</div>
		</ReportComponent>
	)
}