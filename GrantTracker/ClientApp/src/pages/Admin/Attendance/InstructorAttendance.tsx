import React, { ReactElement, useState } from "react"
import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from 'components/ui/table'

import { InstructorRecord } from "Models/StudentAttendance";

import { AttendanceStartTimeInput, AttendanceEndTimeInput } from './TimeComponents'
import { AttendanceForm, ReducerAction } from './state'
import { Checkbox } from '@/components/ui/checkbox'
import AddInstructorModal from "components/Modals/AddInstructorModal";

import api from 'utils/api'
import { DateTimeFormatter } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import { Button } from "@/components/ui/button";


interface IAttendProps {
	orgYearGuid: string
	state: AttendanceForm
	dispatch: React.Dispatch<ReducerAction>
}

export const InstructorAttendance = ({ orgYearGuid, state, dispatch }: IAttendProps): ReactElement => {
	const [showAddModal, setShowAddModal] = useState(false)

	const iColumns = createInstructorColumns(dispatch)

	function addInternalInstructor(instructor, instructorSchoolYearGuid: string): Promise<ApiResult> {

		return api.post(`instructor/add?organizationYearGuid=${orgYearGuid}`, {
			firstName: instructor.firstName.trim(),
			lastName: instructor.lastName.trim(),
			badgeNumber: instructor.badgeNumber?.trim(),
			title: instructor.title?.trim(),
			statusGuid: instructor.statusGuid
		})
		.then(res => {
			let iRecord: InstructorRecord = {
				id: res.data,
				isPresent: true,
				isSubstitute: true,
				firstName: instructor.firstName.trim(),
				lastName: instructor.lastName.trim(),
				title: instructor.title?.trim(),
				times: []
			}

			dispatch({ type: 'addInstructor', payload: iRecord })
		})
	}

	function addExternalInstructor(instructor): Promise<ApiResult> {

		return api.post(`instructor/add?organizationYearGuid=${orgYearGuid}`, {
			firstName: instructor.firstName.trim(),
			lastName: instructor.lastName.trim(),
			statusGuid: instructor.statusGuid
		})
		.then(res => {
			let iRecord: InstructorRecord = {
				id: res.data,
				isPresent: true,
				isSubstitute: true,
				firstName: instructor.firstName.trim(),
				lastName: instructor.lastName.trim(),
				times: []
			}

			dispatch({ type: 'addInstructor', payload: iRecord })
		})
	}

	return (
		<div>
			<div className='mb-3'>
				<Button variant='outline' onClick={() => setShowAddModal(true)}>
					Add Instructor
				</Button>
			</div>

			<DataTable data={state.instructorRecords} columns={iColumns} className='text-sm' containerClassName='w-full overflow-x-auto' />

			<AddInstructorModal 
				show={showAddModal} 
				orgYearGuid={orgYearGuid}
				handleClose={() => setShowAddModal(false)} 
				onInternalChange={addInternalInstructor} 
				onExternalChange={addExternalInstructor}
				variant='attendance'
			/>
		</div>
	)
}


const createInstructorColumns = (dispatch: React.Dispatch<ReducerAction>): ColumnDef<InstructorRecord, any>[] => [
	{
        id: 'present',
        header: () => <HeaderCell label='Present' />,
        accessorKey: 'isPresent',
        enableSorting: false,
        cell: ({ row }) => {
            const record = row.original
            const equalTimes = record.times.filter(x => x.startTime.equals(x.endTime))
            const endBeforeStartTimes = record.times.filter(x => x.endTime.isBefore(x.startTime))
			
			return (
				<div
					role='button'
					className='flex flex-col justify-center items-center'
					onClick={() => dispatch({ type: 'instructorPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
					style={{ minHeight: '100%' }}
				>
					<Checkbox checked={record.isPresent} onCheckedChange={() => {}} />
					{equalTimes.map(time => (
						<div className='text-red-500 break-words' style={{maxWidth: "250px"}}>
							Start and end times cannot be equal. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
						</div>
					))}
					{endBeforeStartTimes.map(time => (
						<div className='text-red-500 break-words' style={{maxWidth: "250px"}}>
							End time cannot be before start. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
						</div>
					))}
				</div>
        	)
		}
    },
	{
		id: 'lastName',
		header: ({ column }) => (
			<HeaderCell 
				label='Last Name'
				sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
				onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			/>
		),
		accessorKey: 'lastName',
		enableSorting: true,
		cell: ({ row }) => {
			const record = row.original
			return <span className={record.isSubstitute ? 'text-gray-600' : ''}>{record.lastName}</span>
		}
	},
	{
		id: 'firstName',
		header: ({ column }) => (
			<HeaderCell 
				label='First Name'
				sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
				onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			/>
		),
		accessorKey: 'firstName',
		enableSorting: true,
		cell: ({ row }) => {
			const record = row.original
			return <span className={record.isSubstitute ? 'text-gray-600' : ''}>{record.firstName}</span>
		}
	},
	{
		id: 'start',
		header: () => <HeaderCell label='Started at' />,
		accessorKey: 'id',
		enableSorting: false,
		cell: ({ row }) =>
			<AttendanceStartTimeInput personId={row.original.id} times={row.original.times} dispatch={dispatch} />
	},
	{
		id: 'end',
		header: () => <HeaderCell label='Ended at' />,
		accessorKey: 'id',
		enableSorting: false,
		cell: ({ row }) =>
			<AttendanceEndTimeInput personId={row.original.id} times={row.original.times} dispatch={dispatch} />
	}
]
