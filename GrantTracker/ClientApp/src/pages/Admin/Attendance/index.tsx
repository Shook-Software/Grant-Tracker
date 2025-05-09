import { DateTimeFormatter, Instant, LocalDate, LocalDateTime, LocalTime } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

import { useQuery } from "@tanstack/react-query";
import { DateOnly } from "Models/DateOnly";
import { Session, SessionDomain, SessionView } from "Models/Session";
import React, { ReactElement, useEffect, useReducer, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { TimeInput } from "components/TimeRangeSelector";
import { DayOfWeek } from "Models/DayOfWeek";
import { TimeScheduleView } from "Models/TimeSchedule";
import { AttendanceForm, AttendanceForm as AttendanceFormState, ReducerAction, handleStateReduction } from './state'
import { StudentRegistration, StudentRegistrationDomain } from "Models/StudentRegistration";

import { InstructorAttendance } from './InstructorAttendance'
import { StudentAttendance } from './StudentAttendance'
import { AttendanceSummary } from './Summary'
import api from "utils/api";
import { TimeOnly } from "Models/TimeOnly";


enum FormState {
	PreviousEntrySelect = -1,
	DateTimeSelect = 0,
	AttendanceRecords = 1,
	Review = 2
}

export default (): React.ReactElement => {
	const [searchParams] = useSearchParams();
	const sessionGuid = searchParams.get('session')

	//going to need the dayscheduleId for the session in order to import
	const attendanceGuid = searchParams.get('attendanceId')

	const [formState, setFormState] = useState<FormState>(FormState.DateTimeSelect)

	const [date, setDate] = useState<LocalDate | undefined>(undefined)
	const [timeSchedules, setTimeSchedules] = useState<TimeScheduleView[] | undefined>(undefined)
	const [attendanceState, dispatch] = useReducer(reducer, {
		defaultTimeSchedule: [],
		studentRecords: [],
		instructorRecords: []
	})
	
	const { isPending: fetchingSession, data: session, error: sessionError } = useQuery({
		queryKey: [`session/${sessionGuid}`],
		select: (session: SessionDomain) => Session.toViewModel(session),
		retry: false,
		staleTime: Infinity
	})

	const { isPending: fetchingStudentRegs, data: studentRegs, error: studentRegError } = useQuery({
		queryKey: [`session/${sessionGuid}/student/registration?dayOfWeek=${(date?.dayOfWeek().value() % 7)}`],
		select: (regs: StudentRegistrationDomain[]) => regs.map(reg =>StudentRegistration.toViewModel(reg)),
		enabled: !!date,
		retry: false,
		staleTime: Infinity
	})

	const { data: priorAttendance } = useQuery({
		queryKey: [`session/${sessionGuid}/attendance/${attendanceGuid}`],
		enabled: !!attendanceGuid,
		retry: false,
		staleTime: Infinity
	})

	function createLocalStorageKey(): string {
		return `attendance-${sessionGuid}-${date?.toString()}`;
	}

	function setLocalStorage(date: LocalDate, state: AttendanceForm) {
		localStorage.setItem(createLocalStorageKey(), JSON.stringify({
			date,
			sessionGuid,
			lastEditedAt: Date.now().toString(),
			state
		}))
	}

	function auditLocalStorage(): void {
		for (let idx = 0; idx < localStorage.length; idx++) {
			const key = localStorage.key(idx);

			if (!key?.startsWith('attendance') || key === createLocalStorageKey())
				continue;

			const value = localStorage.getItem(key);
			const msPerDay = 24 * 60 * 60 * 1000;

			if (!!value && Date.now() - JSON.parse(value).lastEditedAt >= msPerDay * 3) {
				window.localStorage.removeItem(key);
			}
		}
	}

	function getLocalStorageItem(): {date: LocalDate, sessionGuid: string, lastEditedAt: number, state: AttendanceForm} | null {
		const jsonEntry: string | null = localStorage.getItem(createLocalStorageKey());

		if (!jsonEntry)
			return null;
		
		let parsedObj = JSON.parse(jsonEntry);

		return {
			date: LocalDate.parse(parsedObj.date),
			sessionGuid: parsedObj.sessionGuid,
			lastEditedAt: Number(parsedObj.lastEditedAt),
			state: {
				defaultTimeSchedule: parsedObj.state.defaultTimeSchedule.map(sched => ({guid: sched.guid, startTime: LocalTime.parse(sched.startTime), endTime: LocalTime.parse(sched.endTime) })),
				instructorRecords: parsedObj.state.instructorRecords.map(ir => ({
					...ir,
					times: ir.times.map(time => ({ ...time, startTime: LocalTime.parse(time.startTime), endTime: LocalTime.parse(time.endTime) }))
				})),
				studentRecords: parsedObj.state.studentRecords.map(sr => ({
					...sr,
					times: sr.times.map(time => ({ ...time, startTime: LocalTime.parse(time.startTime), endTime: LocalTime.parse(time.endTime) }))
				}))
			}
		}
	}

	function removeFromLocalStorage() {
		window.localStorage.removeItem(createLocalStorageKey());
	}

	function reducer(state: AttendanceForm, action: ReducerAction): AttendanceForm {
		const newState = handleStateReduction(state, action);
		setLocalStorage(date!, state);
		return newState;
	}

	function handleFormStateChange(newState: FormState, formStateOverride: AttendanceForm | null = null) {
		const prevState: FormState = formState

		switch (newState) {
			case FormState.AttendanceRecords:
				if (prevState === FormState.DateTimeSelect || (prevState == FormState.PreviousEntrySelect && !formStateOverride)) 
				{
					if (timeSchedules) {
						dispatch({ type: 'setDefaultTimeSchedules', payload: timeSchedules })
					}

					if (session && studentRegs && timeSchedules) {
						if (!attendanceGuid) {
							dispatch({ type: 'populateInstructors', payload: { instructors: session?.instructors, times: timeSchedules }})
							dispatch({ type: 'populateStudents', payload: { students: studentRegs.map(reg => reg.studentSchoolYear), times: timeSchedules }})
						}
						else { 
							dispatch({ type: 'populateExistingRecords', payload: { instructorAttendance: priorAttendance.instructorAttendanceRecords, studentAttendance: priorAttendance.studentAttendanceRecords }})
						}
					}
				}
				else if (prevState == FormState.PreviousEntrySelect && !!formStateOverride) 
				{
					dispatch({ type: 'overwriteAll', payload: formStateOverride });
				}

				break;
		}

		setFormState(newState);
	}

	function renderForm(): React.ReactElement {
		const continueEnabled: boolean = date
			&& timeSchedules && timeSchedules.length >= 0
			&& (attendanceGuid === null || priorAttendance !== undefined)
			&& !fetchingStudentRegs

		switch (formState) {
			case FormState.PreviousEntrySelect:
				const priorEntry = getLocalStorageItem();

				return (
					<div className='d-flex flex-column gap-2'>
						<p>
							You have an unfinished attendance entry for this session for <b>{priorEntry?.date.format(DateTimeFormatter.ofPattern("MMMM d, y").withLocale(Locale.ENGLISH))}</b>, with {priorEntry?.state.instructorRecords.length} instructor record(s) and {priorEntry?.state.studentRecords.length} student record(s).<br />
							This entry was last edited on <b>{LocalDateTime.ofInstant(Instant.ofEpochMilli(priorEntry!.lastEditedAt))?.format(DateTimeFormatter.ofPattern("MMMM d, y, h:m a").withLocale(Locale.ENGLISH))}</b>.<br />
							Would you like to load this unfinished entry?
						</p>

						<button type='button' className='btn btn-primary btn-sm' style={{width: 'fit-content'}} aria-label='Yes, load unfinished attendance entry.' onClick={() => handleFormStateChange(FormState.AttendanceRecords, priorEntry?.state)}>Yes, load unfinished entry</button>
						<button type='button' className='btn btn-secondary btn-sm' style={{width: 'fit-content'}} aria-label='No, create new attendance entry.' onClick={() => handleFormStateChange(FormState.AttendanceRecords)}>No, create new entry</button>
					</div>
				);
			case FormState.DateTimeSelect:
				return (
					<DateTimeSelection 
						session={session}
						date={date}
						onDateChange={setDate}
						times={timeSchedules}
						onTimeChange={setTimeSchedules}
						progressFormState={() => handleFormStateChange(FormState.AttendanceRecords)}
						originalAttendDate={priorAttendance ? DateOnly.toLocalDate(priorAttendance.instanceDate) : undefined}
						stateIsValidToContinue={continueEnabled}
					/>
				);
			case FormState.AttendanceRecords:
				return (
					<AttendanceForm 
						session={session!}
						attendanceGuid={attendanceGuid}
						date={date!}
						state={attendanceState}
						dispatch={dispatch}
						onSuccessfulSave={() => removeFromLocalStorage(createLocalStorageKey())}
					/>
				)
			default:
				return <></>
		}
	}

	useEffect(() => {
		if (!!date && formState === FormState.DateTimeSelect && !!getLocalStorageItem()) {
			handleFormStateChange(FormState.PreviousEntrySelect);
		}
	}, [date])

	useEffect(() => {
		auditLocalStorage();
	}, [])

	if (fetchingSession || !session)
		return <span>Loading...</span>

	const subHeading: ReactElement | null = priorAttendance?.instanceDate 
		? <h5 className='text-secondary'>Original attendance date - {DateOnly.toLocalDate(priorAttendance.instanceDate).format(DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH))}</h5>
		: null;

	return (
		<div className='w-100'>
			<h3>{session.name}</h3>
			{subHeading}

			<main>
				{renderForm()}
			</main>
		</div>
	)
}

interface AttendanceFormProps {
	session: SessionView
	attendanceGuid: string | null
	date: LocalDate
	state: AttendanceFormState
	dispatch: React.Dispatch<ReducerAction>
	onSuccessfulSave: () => void
}

const AttendanceForm = ({session, attendanceGuid, date, state, dispatch, onSuccessfulSave}: AttendanceFormProps): ReactElement => {
	useEffect(() => {
		if (session.sessionType.label != 'Parent') {
			const studentRecords = state.studentRecords.filter(sr => sr.isPresent).map(sr => ({
				id: sr.id,
				firstName: sr.firstName,
				lastName: sr.lastName,
				times: sr.times?.slice()
			}))
	
			api.post(`session/${session.guid}/attendance/verify?instanceDate=${date}&attendanceGuid=${attendanceGuid ? attendanceGuid : ''}`, studentRecords)
				.then(() => {
					dispatch({type: 'applyStudentConflicts', payload: []})
				})
				.catch(err => {
					if (err.response.status == '409')
						dispatch({
							type: 'applyStudentConflicts', 
							payload: err.response.data.map(x => ({ 
								studentSchoolYearGuid: x.studentSchoolYearGuid,
								startTime: TimeOnly.toLocalTime(x.startTime),
								exitTime: TimeOnly.toLocalTime(x.exitTime)
							}))
						})
				})
		}
	}, [JSON.stringify(state.studentRecords.map(sr => ({ times: sr.times, present: sr.isPresent })))]) //inefficient but we shouldn't need to worry about that here

	return (
		<div>
			<h5 className='text-secondary'>Attendance for {date.format(DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH))}</h5>
			<hr />

			<section>
            	<h5>Instructors</h5>

				<InstructorAttendance orgYearGuid={session.organizationYear.guid} state={state} dispatch={dispatch} />
			</section>

			<section>
            	<h5>Students</h5>

				<StudentAttendance orgYearGuid={session.organizationYear.guid} state={state} dispatch={dispatch} sessionType={session.sessionType.label} />
			</section>

			<section>
				<h5>Summary</h5>
				<hr />
				<AttendanceSummary sessionGuid={session.guid} 
					sessionType={session.sessionType.label} 
					attendanceGuid={attendanceGuid} 
					date={date} 
					state={state}
					onSuccessfulSave={onSuccessfulSave} />
			</section>
		</div>
	)
}

const DateTimeSelection = ({session, date, onDateChange, times, onTimeChange, progressFormState, originalAttendDate, stateIsValidToContinue}): ReactElement => {
	const [searchParams] = useSearchParams();
	const dayOfWeek = searchParams.get('dow') ? Number(searchParams.get('dow')) : ''
	const [editDateInitialized, setEditDateInitialized] = useState<boolean>(false)

	const { isFetching: fetchingDates, data: dates, error: dateError } = useQuery({ 
		queryKey: [`session/${session.guid}/attendance/openDates?${'dayOfWeek=' + (dayOfWeek ? (dayOfWeek % 7) : '')}`],
		select: (dates: DateOnly[]) => dates.map(date => DateOnly.toLocalDate(date)),
		retry: false,
		staleTime: Infinity
	})

	function handleDateChange(date: LocalDate) {
		onDateChange(date)
	}

	function setTimeScheduleStartTime(id: string, time: LocalTime) {
		if (!times)
			return

		let schedule: TimeScheduleView = times.find(x => x.guid === id)!
		schedule.startTime = time;
		onTimeChange([...times])
	}

	function setTimeScheduleEndTime(id: string, time: LocalTime) {
		if (!times)
			return

		let schedule: TimeScheduleView = times.find(x => x.guid === id)!
		schedule.endTime = time;
		onTimeChange([...times])
	}

	useEffect(() => {
		if (dates && dates.length > 0 && !date && !originalAttendDate)
			handleDateChange(dates[0])
	}, [dates?.length])

	useEffect(() => {
		if (session && date)
		{
			let timeScheduleForDate = session.daySchedules
				.find(d => DayOfWeek.toInt(d.dayOfWeek) == date.dayOfWeek().value() % 7)
				?.timeSchedules;

			if (timeScheduleForDate)
				onTimeChange(timeScheduleForDate)
		}
	}, [session?.guid, date?.toString()])

	useEffect(() => {
		if (originalAttendDate && !editDateInitialized) {
			handleDateChange(originalAttendDate)
			setEditDateInitialized(true)
		}
	}, [dates?.length, originalAttendDate])

	const dateFormatter = DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH)

	return (
		<div className='row'>
			<div className='col-xl-2 col-md-4 col-12'>
				<label className='form-label' htmlFor='date-select'>Date</label>
				{
					!dates || dates.length != 0 
						? 	<select className='form-select' aria-label='Select attendance date' value={date?.toString()} onChange={e => handleDateChange(LocalDate.parse(e.target.value))}>
								{originalAttendDate ? <option className='text-primary' value={originalAttendDate.toString()}>{originalAttendDate.format(dateFormatter)}</option> : null}
								{dates?.map(date => (<option value={date.toString()}>{date.format(dateFormatter)}</option>))}
							</select>
						:	<input className='form-control' type='date' aria-label='Select attendance date' value={date?.toString()} onChange={e => handleDateChange(LocalDate.parse(e.target.value))} />
				}

				{
					date && !times ? <div className='text-danger'>No schedule found for this day of week, are you sure this is the correct date?</div> : null
				}
			</div>

			<div className='col-xl-2 col-md-4 col-12'>
				<label className='form-label'>Start Time</label>
				{times?.map(schedule => (
					<TimeInput 
						id={'start-time-' + schedule.guid} 
						value={schedule.startTime} 
						onChange={(time) => setTimeScheduleStartTime(schedule.guid, time)} 
					/>
				))}
			</div>

			<div className='col-xl-2 col-md-4 col-12'>
				<label className='form-label'>End Time</label>
				{times?.map(schedule => (
					<TimeInput 
						id={'end-time-' + schedule.guid} 
						value={schedule.endTime} 
						onChange={(time) => setTimeScheduleEndTime(schedule.guid, time)} 
					/>
				))}
			</div>

			<div className='col-xl-2 d-flex align-items-end'>
				<button className='btn btn-primary' onClick={progressFormState} disabled={!stateIsValidToContinue}>Continue</button>
			</div>	
		</div>
	)
}