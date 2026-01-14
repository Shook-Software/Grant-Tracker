import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { attendanceCheckFields, flattenAttendanceCheck } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { DateOnly } from 'Models/DateOnly'
import { TimeOnly } from 'Models/TimeOnly'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import TimeRecordDisplay from '@/components/ui/TimeRecordDisplay'

interface AttendanceCheckData {
	school: string
	className: string
	sessionGuid: string
	instanceDate: LocalDate
	timeBounds: {
		startTime: any
		endTime: any
	}[]
	instructors: {
		firstName: string
		lastName: string
	}[]
	attendanceEntry: boolean
}

const attendanceCheckColumns: ColumnDef<AttendanceCheckData, any>[] = [
	{
		accessorKey: "school",
		header: () => <HeaderCell label="School" />,
		id: 'school'
	},
	{
		accessorKey: "className",
		header: ({ column }) => (
			<HeaderCell 
				label="Class" 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value)}
				filterPlaceholder="Filter sessions..."
			/>
		),
		filterFn: (row, id, value) => {
			const className = row.getValue(id) as string
			return className?.toLowerCase().includes(value.toLowerCase()) || false
		},
		cell: ({ row }) => (
			<Link to={`/home/admin/sessions/${row.original.sessionGuid}`}>
				{row.getValue("className")}
			</Link>
		),
		id: 'className'
	},
	{
		accessorKey: "instanceDate",
		header: () => <HeaderCell label="Weekday" />,
		cell: ({ row }) => {
			const date = row.getValue("weekday") as LocalDate
			return date?.format(DateTimeFormatter.ofPattern('eeee').withLocale(Locale.ENGLISH))
		},
		id: 'weekday'
	},
	{
		accessorKey: "instanceDate",
		header: () => <HeaderCell label="Date" />,
		cell: ({ row }) => {
			const date = row.getValue("date") as LocalDate
			return date.toString()
		},
		id: 'date'
	},
	{
		accessorKey: "timeBounds",
		header: () => <HeaderCell label="Time Bounds" />,
		cell: ({ row }) => <TimeRecordDisplay timeRecords={row.getValue("timeBounds")} />,
		id: 'timeBounds'
	},
	{
		accessorKey: "instructors",
		header: () => <HeaderCell label="Instructors" />,
		cell: ({ row }) => {
			const instructors = row.getValue("instructors") as AttendanceCheckData['instructors']
			return (
				<div className='flex flex-col justify-around'>
					{instructors.map((instructor, index) => (
						<div key={index} className='flex justify-around'>
							<span>{instructor.firstName}</span>
							<span>{instructor.lastName}</span>
						</div>
					))}
				</div>
			)
		},
		id: 'instructors'
	},
	{
		accessorKey: "attendanceEntry",
		header: 'Entry?',
		cell: ({ row }) => {
			const hasEntry = row.getValue("attendanceEntry") as boolean
			return (
				<div className='text-center'>
					{hasEntry ? (
						<span className='text-success font-bold'>Y</span>
					) : (
						<span className='text-danger font-bold'>N</span>
					)}
				</div>
			)
		},
		filterFn: (row, id, value) => {
			if (value === '') return true
			const isActive = row.getValue(id) as boolean
			return value === 'true' ? isActive : !isActive
		},
		meta: {
			filterOptions: [
				{ value: 'true', label: 'Yes' },
				{ value: 'false', label: 'No' }
			],
			filter: true
		},
		id: 'attendanceEntry'
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
		queryKey: [ `report/attendanceCheck?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		select: (data) => data.map(x => ({
			...x,
			instanceDate: DateOnly.toLocalDate(x.instanceDate),
			timeBounds: x.timeBounds.map(t => ({
			  startTime: TimeOnly.toLocalTime(t.startTime),
			  endTime: TimeOnly.toLocalTime(t.endTime)
			}))
		  })),
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	})

	useEffect(() => {
	  	onRowCountChange(report?.length || 0)
	}, [report?.length])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		>
			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={attendanceCheckColumns}
					data={report || []}
					initialSorting={[{ id: 'school', desc: false }]}
					containerClassName="rounded border"
					tableClassName="table-auto"
					title={`Attendance Check for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						const flattened = flattenAttendanceCheck(values)
						
						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattened, attendanceCheckFields, `Attendance_Check_${fileOrgName}_${fileDate}`)}
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