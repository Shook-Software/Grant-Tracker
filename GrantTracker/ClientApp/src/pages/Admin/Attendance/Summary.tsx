import { ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { Spinner } from "react-bootstrap";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import Table, { Column, SortDirection } from "components/BTable";

import { AttendanceForm } from "./state";
import { InstructorRecord, StudentRecord } from "Models/StudentAttendance";
import { TimeScheduleForm } from "Models/TimeSchedule";
import FamilyMemberOps from 'Models/FamilyMember'

import api from 'utils/api'



interface SummaryProps {
	sessionGuid: string
	sessionType: string
	attendanceGuid: string | null
	date: LocalDate
	state: AttendanceForm
}

export const AttendanceSummary = ({ sessionGuid, sessionType, attendanceGuid, date, state }: SummaryProps): ReactElement => {
	const navigate = useNavigate();
	const [criticalError, setCriticalError] = useState<boolean>(false)
	const [errors, setErrors] = useState<string[]>([])
	const [submitting, setSubmitting] = useState<boolean>(false)

	function handleAttendanceSubmission() {
		setSubmitting(true)

		postAttendance(sessionGuid, attendanceGuid, date, state)
			.then(res => {
				navigate(`/home/admin/sessions/${sessionGuid}`)
			})
			.catch(err => {
				if (err.response.status == 409)
					setErrors(err.response.data)
				else 
					setCriticalError(true)
			})
			.finally(() => {
				setSubmitting(false)
			})
	}

	let studentColumns: Column[] = coreColumns.slice();
	let instructorColumns: Column[] = [...coreColumns.slice(), {...entryExitColumn}];

	if (sessionType === 'Family')
		studentColumns = [studentPresentColumn, ...studentColumns]

    if (sessionType !== 'Parent')
		studentColumns = [...studentColumns, {...entryExitColumn}]

    if (sessionType === 'Parent' || sessionType === 'Family')
		studentColumns = [...studentColumns, {...familyAttendColumn}]

	const instructors: InstructorRecord[] = state.instructorRecords.filter(x => x.isPresent && !x.isSubstitute)
	const substitutes: InstructorRecord[] = state.instructorRecords.filter(x => x.isPresent && x.isSubstitute)
	const students: StudentRecord[] = state.studentRecords.filter(x => x.isPresent).filter(x => sessionType !== 'Parent' || x.familyAttendance.length > 0)

	const submissionIssue: string = state.studentRecords.some(x => x.conflicts.length > 0) ? 'Please correct attendance time conflicts before submission.' : ''


	return (
		<div className='row'>
			<div className='col-lg-6 col-12'>
				<section>
					<h6>Instructors - {instructors.length}</h6>
					<Table dataset={instructors} columns={instructorColumns} defaultSort={{ index: 0, direction: SortDirection.Ascending}} size='sm' />
				</section>

				<section className={substitutes.length === 0 ? 'd-none' : ''}>
					<h6>Substitutes - {substitutes.length}</h6>
					<Table dataset={substitutes} columns={instructorColumns} defaultSort={{ index: 0, direction: SortDirection.Ascending}} size='sm' />
				</section>

				<section>
					<h6>Students - {students.length}</h6>
					<Table dataset={students} columns={studentColumns} defaultSort={{ index: 0, direction: SortDirection.Ascending}} size='sm' />
				</section>
			</div>

			<div className='col-lg-6 col-12'>
				<section>
					<FinalizeDisplay submitting={submitting} submissionIssue={submissionIssue} errors={errors} hasCriticalError={criticalError} handleSubmission={handleAttendanceSubmission} />
				</section>
			</div>
		</div>
	)
}

const FinalizeDisplay = ({ submitting, submissionIssue, errors, hasCriticalError, handleSubmission }): ReactElement => {
	if (hasCriticalError)
		return (
			<div className='d-flex flex-column'>
				<span className='text-danger'>Submission Failed</span>
				<span>Please send an email detailing the contents of this attendance record and we will diagnose and correct the issue as soon as able.</span>
				<span>Apologies for the inconvenience.</span>
			</div>
		)

	if (errors.length !== 0)
		return (
			<>
				<h6>Conflicts</h6>

				<ul className='list-group'>
					{errors.map(error => <li className='list-group-item text-danger'>{error}</li>)}
				</ul>
			</>
		)

	if (submissionIssue) 
		return (
			<>
				<h6 className='text-danger'>{submissionIssue}</h6>
				<button className='btn btn-secondary' type='button' onClick={() => handleSubmission()} disabled={true}>
					{submitting ? <><Spinner /> Submitting</> : 'Submit'}
				</button>
			</>
		)

	return (
		<>
			<h6 className='text-secondary'>Everything looks good?</h6>
			<button className='btn btn-secondary' type='button' onClick={() => handleSubmission()}>
				{submitting ? <><Spinner /> Submitting</> : 'Submit'}
			</button>
		</>
	)
}

function postAttendance(sessionGuid: string, attendanceGuid: string | null, date: LocalDate, form: AttendanceForm): Promise<void> {
	
	let formattedAttendance = {
		date,
		instructorRecords: form.instructorRecords.filter(ir => ir.isPresent).map(ir => ({
			id: ir.id,
			isSubstitute: ir.isSubstitute,
			times: ir.times.slice()
		})),
		studentRecords: form.studentRecords.filter(sr => sr.isPresent).map(sr => ({
			id: sr.id,
			firstName: sr.firstName,
			lastName: sr.lastName,
			times: sr.times?.slice(),
			familyAttendance: sr.familyAttendance.slice()
		}))
	}
	
	if (attendanceGuid)
		return api.patch(`session/${sessionGuid}/attendance/${attendanceGuid}`, formattedAttendance)
	
	return api.post(`session/${sessionGuid}/attendance`, formattedAttendance)
}

const coreColumns: Column[] = [
	{
		label: 'Last Name',
		attributeKey: 'lastName',
		sortable: true
	},
	{
		label: 'First Name',
		attributeKey: 'firstName',
		sortable: true
	}
]

const entryExitColumn: Column = {
	label: 'Entry/Exit',
	attributeKey: '',
	sortable: false,
	transform: (record: StudentRecord | InstructorRecord) => {
		const studentConflicts = record.conflicts || []
		
		return (
			<div className={(studentConflicts.length > 0 ? ' border border-danger' : '')}>
				{record.times.map(time => (
					<div className={'d-flex justify-content-evenly'}>
						<div className='text-center flex-1'>{time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
						<div className='text-center flex-1'>{time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
					</div>
				))}
				{studentConflicts.map(conflict => (
					<div className='text-danger text-break text-center'>
						Conflict from {conflict.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {conflict.exitTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
					</div>
				))}
			</div>
		)
	},
	headerProps: { className: 'text-center' },
	cellProps:  { style: { padding: 0} }
}

const studentPresentColumn: Column = {
	label: 'Student Present',
	attributeKey: '',
	sortable: false,
	transform: (record: StudentRecord) => record.times.length > 0 ? <span className='text-success'>Y</span> : <span className='text-danger'>N</span>
}

const familyAttendColumn: Column = {
	label: 'Family Attendance',
	attributeKey: 'familyAttendance',
	key: 'familyAttendance',
	sortable: false,
	headerTransform: () => (
	  <th style={{...{ fontSize: '0.75rem', padding: '0.25rem 0.25rem'}}}>
		<div className='d-flex flex-wrap'> 
		  <span className='w-100 text-center'>Family Attendance</span>
		  <span className='w-50 text-center'>Family Member</span>
		  <span className='w-50 text-center'>Count</span>
		</div>
	  </th>
	),
	transform: (familyAttendanceRecord) => (
	  <div className='d-flex align-items-center flex-wrap h-100'>
		{
		  familyAttendanceRecord.map(fa => (
			<>
			  <span className='w-50 text-center'>{FamilyMemberOps.toString(fa.familyMember)}</span>
			  <span className='w-50 text-center'>{fa.count}</span>
			</>
		  ))
		}
	  </div>
	),
	headerProps: { className: 'text-center' }
}