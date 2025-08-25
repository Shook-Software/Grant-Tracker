import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { Locale } from '@js-joda/locale_en-us';
import { useState, useEffect } from 'react';
import { FormControl } from '../../Form';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from 'components/DataTable';

import { DropdownOption, SimpleSessionView } from 'Models/Session'
import { DateOnly } from 'Models/DateOnly';
import { DayOfWeek } from 'Models/DayOfWeek';
import paths from 'utils/routing/paths';

interface CopyAttendanceModalProps {
	sourceSessionGuid: string
	sourceAttendanceGuid: string
	sourceDate: LocalDate
	sessions: SimpleSessionView[]
}

const dateFormatter = DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH)
const timeFormatter = DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH)

export const CopyAttendanceModal = ({ sourceSessionGuid, sourceAttendanceGuid, sourceDate, sessions }: CopyAttendanceModalProps): JSX.Element => {
	const navigate = useNavigate();
	const [targetDate, setTargetDate] = useState<LocalDate>(sourceDate);
	const [targetSessionGuid, setTargetSessionGuid] = useState<string | null>(null);

	const { isFetching: fetchingDates, data: dates, error: dateError } = useQuery({
		queryKey: [`session/${targetSessionGuid}/attendance/openDates`],
		select: (dates: DateOnly[]) => dates.map(date => DateOnly.toLocalDate(date)),
		enabled: !!targetSessionGuid,
		retry: false,
		staleTime: Infinity
	})

	function handleSessionClick(row: SimpleSessionView) {
		setTargetSessionGuid(row.sessionGuid)
		// Scroll to top of modal
		setTimeout(() => {
			const modalElement = document.querySelector('[role="dialog"]')
			if (modalElement) {
				const scrollElement = modalElement.querySelector('[data-scroll-container]')
				if (scrollElement) {
					scrollElement.scrollTop = 0
				}
			}
		}, 100)
	}

	function handleAttendanceNavigation() {
		navigate(`${paths.Admin.Attendance.path}?session=${targetSessionGuid}&sourceAttendanceId=${sourceAttendanceGuid}&date=${targetDate.toString()}`)
	}

	return (
		<div className='space-y-6'>
			<div>
				{!!targetSessionGuid ? (
					<div className='flex items-end gap-3'>
						<DateSelection
							targetDate={targetDate}
							dates={dates}
							setDate={setTargetDate}
							loadingDates={fetchingDates}
							error={dateError}
						/>

							<Button
								disabled={!targetSessionGuid || !targetDate}
								onClick={handleAttendanceNavigation}
							>
								Continue
							</Button>
					</div>
				) : (
					<div className='text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded'>Please select a session below</div>
				)}
			</div>

			<div className='space-y-3'>
				<DataTable
					columns={sessionColumns}
					data={sessions}
					onRowClick={handleSessionClick}
					initialSorting={[{ id: 'name', desc: false }]}
					emptyMessage="No sessions found."
					className="hover:bg-gray-50 cursor-pointer"
					containerClassName='w-full'
				/>
			</div>
		</div>
	);
}

const DateSelection = ({ targetDate, dates, setDate, loadingDates, error }) => {

	let render = <></>

	if (loadingDates) {
		render = (
			<div className="flex items-center justify-center p-4">
				<Spinner />
			</div>
		)
	} else if (!!error) {
		render = <div className='text-red-600 p-3 bg-red-50 border border-red-200 rounded'>Unable to load open attendance dates.</div>
	} else if (!dates || dates.length == 0) {
		render = (
			<FormControl
				type='date'
				aria-label='Select attendance date'
				value={targetDate?.toString()}
				onChange={e => setDate(LocalDate.parse(e.target.value))}
			/>
		)
	} else {
		render = (
			<FormControl
				as='select'
				aria-label='Select attendance date'
				value={targetDate?.toString()}
				onChange={e => setDate(LocalDate.parse(e.target.value))}
			>
				{dates?.map(date => (
					<option key={date.toString()} value={date.toString()}>
						{date.format(dateFormatter)}
					</option>
				))}
			</FormControl>
		)
	}

	return (
		<div className='space-y-3'>
			<label className='block text-sm font-medium text-gray-700'>Date</label>
			{render}
		</div>
	)
}

const sessionColumns: ColumnDef<SimpleSessionView>[] = [
	{
		header: 'Name',
		accessorKey: 'name',
		cell: ({ row }) => row.original.name
	},
	{
		header: 'Session Type',
		accessorKey: 'sessionType',
		cell: ({ row }) => row.original.sessionType.label
	},
	{
		header: 'Schedule',
		id: 'schedule',
		cell: ({ row }) => {
			const session = row.original
			if (!session.daySchedules || session.daySchedules.length === 0)
				return <Badge variant="outline">No Schedule</Badge>
			return (
				<div className='space-y-1'>
					{session.daySchedules
						.sort((a, b) => DayOfWeek.toInt(a.dayOfWeek) - DayOfWeek.toInt(b.dayOfWeek))
						.flatMap(ds => ds.timeSchedules
							.slice() // Create a copy to avoid mutating original array
							.sort((a, b) => a.startTime.compareTo(b.startTime))
							.map((ts, idx) => (
								<Badge key={ts.guid} variant="secondary" className='flex justify-between min-w-0'>
									<span className='font-medium'>{idx === 0 ? DayOfWeek.toChar(ds.dayOfWeek) : ''}</span>
									<span className='ml-2'>{`${ts.startTime.format(timeFormatter)} to ${ts.endTime.format(timeFormatter)}`}</span>
								</Badge>
							))
						)
					}
				</div>
			)
		},
		enableSorting: false
	},
]