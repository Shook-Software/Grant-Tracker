"use client"

import * as React from "react"
import { SimpleSessionView } from 'Models/Session'
import { DropdownOption } from 'types/Session'

import { ColumnDef } from "@tanstack/react-table"

import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"

import { Button } from "components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "components/ui/toggle-group"

import { DayOfWeek, daysOfWeekNumeric } from 'Models/DayOfWeek'
import { Link } from 'react-router-dom'

const columns: ColumnDef<SimpleSessionView, any>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<HeaderCell 
				label="Name" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value.trim())}
			/>
		),
		id: 'name'
	},
	{
		accessorKey: "activity.label",
		header: ({ column }) => (
			<HeaderCell label="Activity">
				<Select 
					value={column.getFilterValue() as string || "all"}
					onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{/* Activities will be populated dynamically */}
					</SelectContent>
				</Select>
			</HeaderCell>
		),
		filterFn: (row, id, value) => {
			if (!value) return true
			return row.original.activity.label === value
		},
		id: 'activity.label'
	},
	{
		accessorKey: "sessionType.label",
		header: ({ column }) => (
			<HeaderCell label="Type">
				<Select 
					value={column.getFilterValue() as string || "all"}
					onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{/* Session types will be populated dynamically */}
					</SelectContent>
				</Select>
			</HeaderCell>
		),
		filterFn: (row, id, value) => {
			if (!value) return true
			return row.original.sessionType.label === value
		},
		id: 'sessionType.label'
	},
	{
		accessorKey: 'instructors',
		header: ({ column }) =>  (
			<HeaderCell 
				label="Instructors" 
				filterValue={column.getFilterValue() as string}
				onFilterChange={(event) => column.setFilterValue(event.target.value)}
			/>
		),
		filterFn: (row, id, value) => row.original.instructors.some(instructor => `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(value.toLowerCase())) ,
		cell: ({ row }) => (
			<div className='flex flex-col space-y-1'>
				{row.original.instructors.map((instructor, idx) => (
					<div key={idx}>{instructor.firstName} {instructor.lastName}</div>
				))}
			</div>
		),
		id: 'instructors'
	},
	{
		header: ({ column }) => {
			return (
				<HeaderCell label="Schedule">
					<ToggleGroup 
						className='justify-start' 
						type='multiple' 
						size='sm' 
						value={column.getFilterValue() ?? []}
						onValueChange={(values) => column.setFilterValue(values)}
					>
						{daysOfWeekNumeric.map(dowNum => 
							<ToggleGroupItem value={DayOfWeek.toString(dowNum)} aria-label={'Filter ' + DayOfWeek.toString(dowNum)}>
								{DayOfWeek.toChar(dowNum)}
							</ToggleGroupItem>
						)}
					</ToggleGroup>
				</HeaderCell>
			)
		},
		filterFn: (row, id, value) => row.original.daySchedules.some(ds => value.includes(ds.dayOfWeek.toString())),
		cell: ({ row }) => (
			row.original.daySchedules.map(day => day.dayOfWeek).sort().map((dayOfWeek, index) =>
				index !== row.original.daySchedules.length - 1
					? `${DayOfWeek.toChar(dayOfWeek)}, `
					: DayOfWeek.toChar(dayOfWeek)
			)
		),
		id: 'schedule'
	},
	{
		header: "",
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Button size='sm' asChild>
					<Link to={row.original.sessionGuid}>
						View
					</Link>
				</Button>
			</div>
		),
		id: 'view',
	},
]


interface SessionDataTableProps {
  data: SimpleSessionView[],
  missingAttendance: AttendanceRecord[] | undefined,
  openSessionGuid: string | undefined,
  activities?: DropdownOption[],
  sessionTypes?: DropdownOption[]
  onRowClick?: (row: SimpleSessionView) => void
}

export function SessionDataTable({
  data,
  missingAttendance,
  openSessionGuid,
  activities = [],
  sessionTypes = [],
  onRowClick
}: SessionDataTableProps) {

	const initialColumnFilters = [
		{ 
			id: 'schedule', 
			value: daysOfWeekNumeric.map(dowNum => DayOfWeek.toString(dowNum))
		}
	]

	// Create a custom cell renderer for the first column that handles styling
	const getCustomCellClassName = React.useCallback((cellIndex: number, row: SimpleSessionView) => {
		if (cellIndex === 0) {
			if (openSessionGuid === row.sessionGuid) {
				return "text-blue-600"
			}
			if (missingAttendance?.some(x => x.sessionGuid === row.sessionGuid)) {
				return "text-red-600"
			}
		}
		return ""
	}, [openSessionGuid, missingAttendance])

	// Custom columns with conditional styling and dynamic filter options
	const styledColumns = React.useMemo(() => {
		const columnsToUse = openSessionGuid ? [columns[0]] : columns
		
		return columnsToUse.map((column, index) => {
			// Handle dynamic filter options for Activity and Type columns
			if (column.accessorKey === 'activity.label' && activities.length > 0) {
				return {
					...column,
					header: ({ column: col }) => (
						<HeaderCell label="Activity">
							<Select 
								value={col.getFilterValue() as string || "all"}
								onValueChange={(value) => col.setFilterValue(value === "all" ? "" : value)}
							>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									{activities.map(activity => (
										<SelectItem key={activity.guid} value={activity.label}>
											{activity.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</HeaderCell>
					),
					cell: ({ row, ...rest }) => {
						const originalCell = column.cell
						const cellContent = typeof originalCell === 'function' 
							? originalCell({ row, ...rest })
							: row.getValue(column.accessorKey as string)

						const className = getCustomCellClassName(index, row.original)
						
						return (
							<div className={className}>
								{cellContent}
							</div>
						)
					}
				}
			}
			
			if (column.accessorKey === 'sessionType.label' && sessionTypes.length > 0) {
				return {
					...column,
					header: ({ column: col }) => (
						<HeaderCell label="Type">
							<Select 
								value={col.getFilterValue() as string || "all"}
								onValueChange={(value) => col.setFilterValue(value === "all" ? "" : value)}
							>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									{sessionTypes.map(type => (
										<SelectItem key={type.guid} value={type.label}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</HeaderCell>
					),
					cell: ({ row, ...rest }) => {
						const originalCell = column.cell
						const cellContent = typeof originalCell === 'function' 
							? originalCell({ row, ...rest })
							: row.getValue(column.accessorKey as string)

						const className = getCustomCellClassName(index, row.original)
						
						return (
							<div className={className}>
								{cellContent}
							</div>
						)
					}
				}
			}

			return {
				...column,
				cell: ({ row, ...rest }) => {
					const originalCell = column.cell
					const cellContent = typeof originalCell === 'function' 
						? originalCell({ row, ...rest })
						: row.getValue(column.accessorKey as string)

					const className = getCustomCellClassName(index, row.original)
					
					return (
						<div className={className}>
							{cellContent}
						</div>
					)
				}
			}
		})
	}, [openSessionGuid, getCustomCellClassName, activities, sessionTypes])

	return (
		<DataTable
			columns={styledColumns}
			containerClassName='w-fit'
			data={data}
			initialColumnFilters={initialColumnFilters}
			emptyMessage="No results."
			onRowClick={onRowClick}
		/>
	)
}



