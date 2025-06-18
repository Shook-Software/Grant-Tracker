//From an existing record, pre-populate into this modal
//Source Session Records

//show list of sessions, select one, then display days of week (by default to the day)

//show full attendance w/ summary - maybe a summary then options to edit or submit.

//"It'll be more likely to copy to another session that same day."


//Show list of sessions for a selectable day, defaulted to today and excluding the current one.

//one a session is selected (have back arrows), populate a summary with default times. Looks good? Submit. Otherwise, edit.


import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { Locale } from '@js-joda/locale_en-us';
import { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';

import { DropdownOption, SimpleSessionView } from 'Models/Session'
import { DateOnly } from 'Models/DateOnly';
import Table,{ Column, SortDirection } from 'components/BTable';
import { DayOfWeek } from 'Models/DayOfWeek';
import { useNavigate } from 'react-router-dom';
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
    const [sessionSearchTerm, setSessionSearchTerm] = useState<string>('')

	const { isFetching: fetchingDates, data: dates, error: dateError } = useQuery({ 
		queryKey: [`session/${targetSessionGuid}/attendance/openDates`],
		select: (dates: DateOnly[]) => dates.map(date => DateOnly.toLocalDate(date)),
		enabled: !!targetSessionGuid,
		retry: false,
		staleTime: Infinity
	})

    function handleSessionSearchTermChange(term) {
        term = term.toLocaleLowerCase()
        setSessionSearchTerm(term)
    }

	function handleSessionClick(event, row: SimpleSessionView) {
		setTargetSessionGuid(row.sessionGuid)
	}

	function handleAttendanceNavigation() {
		navigate(`${paths.Admin.Attendance.path}?session=${targetSessionGuid}&sourceAttendanceId=${sourceAttendanceGuid}&date=${targetDate.toString()}`)
	}

	return (
		<div className=''>
			<div className='row'>
				<div className='col-6'>
					<Form.Control
						type='text'
						className='border-bottom-0'
						placeholder='Filter sessions...'
						value={sessionSearchTerm}
						onChange={(e) => handleSessionSearchTermChange(e.target.value)}
						style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
					/>
					
					<Table
						columns={sessionColumns}
						dataset={sessions.filter(session => session.name.toLocaleLowerCase().includes(sessionSearchTerm))}
						defaultSort={{ index: 0, direction: SortDirection.Ascending }}
						rowProps={{ key: 'sessionGuid', onClick: handleSessionClick }}
					/>
				</div> 

				<div className='col-6'>
					{!!targetSessionGuid ? <DateSelection targetDate={targetDate} dates={dates} setDate={setTargetDate} loadingDates={fetchingDates} error={dateError} /> : <div className='text-muted'>Please select a session</div>}
					<div className='mt-3 d-flex justify-content-end'>
						<button className='btn btn-primary' type='button' disabled={!targetSessionGuid || !targetDate} onClick={handleAttendanceNavigation}>Continue</button>
					</div>
				</div>
			</div>
		</div>
	);
}

const DateSelection = ({targetDate, dates, setDate, loadingDates, error}) => {

	let render = <></>

	if (loadingDates)
		render = <Spinner title='Loading dates...' />
	else if (!!error)
		render = <div className='text-danger'>Unable to load open attendance dates.</div>
	else if (!dates || dates.length == 0)
		render = <input className='form-control' type='date' aria-label='Select attendance date' value={targetDate?.toString()} onChange={e => setDate(LocalDate.parse(e.target.value))} />
	else 
		render = <select className='form-select' aria-label='Select attendance date' value={targetDate?.toString()} onChange={e => setDate(LocalDate.parse(e.target.value))}>
					{dates?.map(date => (<option value={date.toString()}>{date.format(dateFormatter)}</option>))}
				</select>

	return (
		<div className='d-flex flex-column'>
			<label className='form-label' htmlFor='date-select'>Date</label>
			{render}
		</div>
	)
}

const sessionColumns: Column[] = [
	{
        label: 'Name',
        attributeKey: 'name',
		sortable: true
	},
    {
        label: 'Session Type',
        attributeKey: 'sessionType',
        sortable: true,
        transform: (value: DropdownOption) => value.label
    },
	{
		label: 'Schedule',
		attributeKey: '',
		sortable: false,
		transform: (session: SimpleSessionView) => {
			if (!session.daySchedules || session.daySchedules.length === 0)
				return 'No Schedule'

			return <div>
					{session.daySchedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
							.flatMap(ds => ds.timeSchedules.map((ts, idx) => (
								<div className='d-flex justify-content-between' key={ts.guid}>
									<div>{idx === 0 ? DayOfWeek.toChar(ds.dayOfWeek) : ''}</div>
									<div>{`${ts.startTime.format(timeFormatter)} to ${ts.endTime.format(timeFormatter)}`}</div>
								</div>
							)))
					}
			</div>
		}
	},
]