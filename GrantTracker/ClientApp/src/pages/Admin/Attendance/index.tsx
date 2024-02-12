import { DateTimeFormatter, LocalDate, LocalTime } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

import { useQuery } from "@tanstack/react-query";
import { DateOnly } from "Models/DateOnly";
import { Session, SessionDomain, SessionView } from "Models/Session";
import React, { ReactElement, useEffect, useReducer, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { TimeInput } from "components/TimeRangeSelector";
import { DayOfWeek } from "Models/DayOfWeek";
import { TimeScheduleForm, TimeScheduleView } from "Models/TimeSchedule";
import { AttendanceForm, AttendanceForm as AttendanceFormState, ReducerAction, reducer } from './state'
import Table, { Column } from "components/BTable";
import { InstructorRecord } from "Models/StudentAttendance";
import { StudentRegistration, StudentRegistrationDomain } from "Models/StudentRegistration";
import AddInstructorModal from "components/Modals/AddInstructorModal";

import { InstructorAttendance } from './InstructorAttendance'
import { StudentAttendance } from './StudentAttendance'
import { AttendanceSummary } from './Summary'


enum FormState {
	DateTimeSelect = 0,
	AttendanceRecords = 1,
	Review = 2
}

export default (): React.ReactElement => {
	const [searchParams] = useSearchParams();
	const sessionGuid = searchParams.get('session')

	const [formState, setFormState] = useState<FormState>(FormState.DateTimeSelect)

	const [date, setDate] = useState<LocalDate | undefined>(undefined)
	const [timeSchedules, setTimeSchedules] = useState<TimeScheduleView[] | undefined>(undefined)
	const [attendanceState, dispatch] = useReducer(reducer, {
		defaultTimeSchedule: [],
		studentRecords: [],
		instructorRecords: [],
		substituteRecords: []
	})

	const { isFetching: fetchingSession, data: session, error: sessionError } = useQuery({
		queryKey: [`session/${sessionGuid}`],
		select: (session: SessionDomain) => Session.toViewModel(session),
		retry: false,
		staleTime: Infinity
	})

	const { isFetching: fetchingStudentRegs, data: studentRegs, error: studentRegError } = useQuery({
		queryKey: [`session/${sessionGuid}/registration?dayOfWeek=${date?.dayOfWeek().value()}`],
		select: (regs: StudentRegistrationDomain[]) => regs.map(reg =>StudentRegistration.toViewModel(reg)),
		enabled: !!date,
		retry: false,
		staleTime: Infinity
	})

	function handleFormStateChange(newState: FormState) {
		const prevState: FormState = formState

		switch (newState) {
			case FormState.AttendanceRecords:
				if (prevState === FormState.DateTimeSelect) 
				{
					if (timeSchedules) {
						dispatch({ type: 'setDefaultTimeSchedules', payload: timeSchedules })
					}

					if (session && studentRegs && timeSchedules) {
						dispatch({ type: 'populateInstructors', payload: { instructors: session?.instructors, times: timeSchedules }})
						dispatch({ type: 'populateStudents', payload: { students: studentRegs.map(reg => reg.studentSchoolYear), times: timeSchedules }})
					}
				}

				break;
		}

		setFormState(newState);
	}

	function renderForm(): React.ReactElement {
		switch (formState) {
			case FormState.DateTimeSelect:
				return (
					<DateTimeSelection 
						session={session}
						date={date}
						onDateChange={setDate}
						times={timeSchedules}
						onTimeChange={setTimeSchedules}
						progressFormState={() => handleFormStateChange(FormState.AttendanceRecords)}
					/>
				);
			case FormState.AttendanceRecords:
				return (
					<AttendanceForm 
						session={session!}
						date={date!}
						state={attendanceState}
						dispatch={dispatch}
					/>
				)
			default:
				return <></>
		}
	}

	if (!session)
		return <span>Loading...</span>

	return (
		<div className='w-100'>
			<h3>{session.name}</h3>

			<main>
				{renderForm()}
			</main>
		</div>
	)
}

interface AttendanceFormProps {
	session: SessionView
	date: LocalDate
	state: AttendanceForm
	dispatch: React.Dispatch<ReducerAction>
}



const AttendanceForm = ({session, date, state, dispatch}: AttendanceFormProps): ReactElement => {
	console.log(state)


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
				<AttendanceSummary state={state} />
			</section>
		</div>
	)
}

const DateTimeSelection = ({session, date, onDateChange, times, onTimeChange, progressFormState}): ReactElement => {

	const { isFetching: fetchingDates, data: dates, error: dateError } = useQuery({ 
		queryKey: [`session/${session.guid}/attendance/openDates`],
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
		if (dates && dates.length > 0 && !date)
			handleDateChange(dates[0])
	}, [dates?.length])

	useEffect(() => {
		if (session && date)
		{
			let timeScheduleForDate = session.daySchedules
				.find(d => DayOfWeek.toInt(d.dayOfWeek) == date.dayOfWeek().value())
				?.timeSchedules;

			if (timeScheduleForDate)
			onTimeChange(timeScheduleForDate)
		}
	}, [session?.guid, date?.toString()])

	const dateFormatter = DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH)

	return (
		<div className='row'>
			<div className='col-xl-2 col-md-4 col-12'>
				<label className='form-label' htmlFor='date-select'>Select Date</label>
				<select className='form-select' aria-label='Select attendance date' value={date?.toString()} onChange={e => handleDateChange(LocalDate.parse(e.target.value))}>
					{dates?.map(date => (<option value={date.toString()}>{date.format(dateFormatter)}</option>))}
				</select>
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

			<div className='col-xl-2'>
				<button className='btn btn-primary' onClick={progressFormState}>Continue</button>
			</div>	
		</div>
	)
}