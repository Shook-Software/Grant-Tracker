import * as React from "react"
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { flattenSummaryOfClasses, summaryOfClassesFields } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { DateOnly } from 'Models/DateOnly'
import { NavLink } from 'react-router-dom'
import { Button } from "@/components/ui/button"

interface SummaryOfClassesData {
	sessionName: string
	sessionGuid: string
	organizationYearGuid: string
	activityType: string
	fundingSource: string
	objectives: string[]
	firstSession: any
	lastSession: any
	instructors: {
		firstName: string
		lastName: string
	}[]
	weeksToDate: number
	avgHoursPerDay: number
	avgDailyAttendance: number
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
		queryKey: [ `report/summaryOfClasses?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	  })

	  useEffect(() => {
		onRowCountChange(report?.length || 0)
	  }, [report])

	const activityTypeOptions = useMemo(() => [...new Set(report?.map(r => r.activityType).filter(Boolean))].map(v => ({ value: v, label: v })), [report])
	const fundingSourceOptions = useMemo(() => [...new Set(report?.map(r => r.fundingSource).filter(Boolean))].map(v => ({ value: v, label: v })), [report])

	const summaryOfClassesColumns = useMemo<ColumnDef<SummaryOfClassesData, any>[]>(() => [
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
			cell: ({ row }) => (
				<NavLink to={`/home/admin/sessions/${row.original.sessionGuid}?oyGuid=${row.original.organizationYearGuid}`}>
					{row.getValue("sessionName")}
				</NavLink>
			),
			id: 'sessionName'
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
			accessorKey: "objectives",
			header: ({ column }) => (
				<HeaderCell 
					label="Objective" 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Search objectives..."
				/>
			),
			filterFn: (row, id, value) => {
				const objectives = row.getValue(id) as string[]
				if (!value) return true
				return objectives?.some(obj => obj.toLowerCase().includes(value.toLowerCase())) || false
			},
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
			accessorKey: "firstSession",
			header: ({ column }) => (
				<HeaderCell 
					label="Start Date" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
				/>
			),
			cell: ({ row }) => {
				const date = row.getValue("firstSession")
				return DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
			},
			id: 'firstSession'
		},
		{
			accessorKey: "lastSession",
			header: ({ column }) => (
				<HeaderCell 
					label="End Date" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
				/>
			),
			cell: ({ row }) => {
				const date = row.getValue("lastSession")
				return DateOnly.toLocalDate(date).format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))
			},
			id: 'lastSession'
		},
		{
			accessorKey: "instructors",
			header: () => <HeaderCell label="Instructors" />,
			cell: ({ row }) => {
				const instructors = row.getValue("instructors") as SummaryOfClassesData['instructors']
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
		},
		{
			accessorKey: "weeksToDate",
			header: ({ column }) => (
				<HeaderCell 
					label="Weeks to Date" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min weeks..."
				/>
			),
			filterFn: (row, id, value) => {
				const weeks = row.getValue(id) as number
				const minWeeks = parseFloat(value) || 0
				return weeks >= minWeeks
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("weeksToDate") as number) * 100) / 100}</div>
			),
			id: 'weeksToDate'
		},
		{
			accessorKey: "avgHoursPerDay",
			header: ({ column }) => (
				<HeaderCell 
					label="Avg Hours Per Day" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min hours..."
				/>
			),
			filterFn: (row, id, value) => {
				const hours = row.getValue(id) as number
				const minHours = parseFloat(value) || 0
				return hours >= minHours
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("avgHoursPerDay") as number) * 100) / 100}</div>
			),
			id: 'avgHoursPerDay'
		},
		{
			accessorKey: "avgDailyAttendance",
			header: ({ column }) => (
				<HeaderCell 
					label="Avg Attendees" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
					filterValue={column.getFilterValue() as string}
					onFilterChange={(event) => column.setFilterValue(event.target.value)}
					filterPlaceholder="Min attendees..."
				/>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number
				const minCount = parseFloat(value) || 0
				return count >= minCount
			},
			cell: ({ row }) => (
				<div className='text-center'>{Math.floor((row.getValue("avgDailyAttendance") as number) * 100) / 100}</div>
			),
			id: 'avgDailyAttendance'
		}
	], [activityTypeOptions, fundingSourceOptions])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={summaryOfClassesColumns}
					data={report || []}
					initialSorting={[{ id: 'sessionName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Summary of Classes for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						const flattened = flattenSummaryOfClasses(values)
						
						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattened, summaryOfClassesFields, `Summary_of_Classes_${fileOrgName}_${fileDate}`)}
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