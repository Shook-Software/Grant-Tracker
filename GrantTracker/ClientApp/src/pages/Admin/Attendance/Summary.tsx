import { ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

import { AttendanceForm } from "./state";
import { InstructorRecord, StudentRecord } from "Models/StudentAttendance";
import { TimeScheduleForm } from "Models/TimeSchedule";
import FamilyMemberOps from 'Models/FamilyMember'

import api from 'utils/api'
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { HeaderCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";



interface SummaryProps {
	sessionGuid: string
	sessionType: string
	attendanceGuid: string | null
	date: LocalDate
	state: AttendanceForm
	onSuccessfulSave: () => void
}

export const AttendanceSummary = ({ sessionGuid, sessionType, attendanceGuid, date, state, onSuccessfulSave }: SummaryProps): ReactElement => {
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
				onSuccessfulSave()
			})
	}

	let studentColumns: ColumnDef<any, any>[] = coreColumns.slice();
	let instructorColumns: ColumnDef<any, any>[] = [...coreColumns.slice(), {...entryExitColumn}];

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
		<div className='flex flex-nowrap gap-3 mb-6'>
			<div className='flex flex-col gap-3 w-6/10'>
				<div>
					<h6>Instructors - {instructors.length}</h6>
					<DataTable data={instructors} columns={instructorColumns} initialSorting={[{ id: 'lastName', desc: false}]} className='text-sm' containerClassName="w-full" />
				</div>

				<div className={substitutes.length === 0 ? 'hidden' : ''}>
					<h6>Substitutes - {substitutes.length}</h6>
					<DataTable data={substitutes} columns={instructorColumns} initialSorting={[{ id: 'lastName', desc: false}]} className='text-sm' containerClassName="w-full" />
				</div>

				<div>
					<h6>Students - {students.length}</h6>
					<DataTable data={students} columns={studentColumns} initialSorting={[{ id: 'lastName', desc: false}]} className='text-sm' containerClassName="w-full" />
				</div>
			</div>

			<div className='w-7/20 pt-4'>
				<div>
					<FinalizeDisplay submitting={submitting} submissionIssue={submissionIssue} errors={errors} hasCriticalError={criticalError} handleSubmission={handleAttendanceSubmission} />
				</div>
			</div>
		</div>
	)
}

const FinalizeDisplay = ({ submitting, submissionIssue, errors, hasCriticalError, handleSubmission }): ReactElement => {
	if (hasCriticalError)
		return (
			<div className='flex flex-col'>
				<span className='text-red-500'>Submission Failed</span>
				<span>Please send an email detailing the contents of this attendance record and we will diagnose and correct the issue as soon as able.</span>
				<span>Apologies for the inconvenience.</span>
			</div>
		)

	if (errors.length !== 0)
		return (
			<>
				<h6>Conflicts</h6>

				<ul className='bg-white border border-gray-200 rounded'>
					{errors.map(error => <li className='px-4 py-3 border-b border-gray-200 last:border-b-0 text-red-500'>{error}</li>)}
				</ul>
			</>
		)

	if (submissionIssue) 
		return (
			<>
				<h6 className='text-red-500'>{submissionIssue}</h6>
				<Button variant='outline' onClick={() => handleSubmission()} disabled={true}>
					{submitting ? <><Spinner /> Submitting</> : 'Submit'}
				</Button>
			</>
		)

	return (
		<>
			<h6 className='text-gray-600'>Everything looks good?</h6>
			<Button variant='outline' onClick={() => handleSubmission()}>
				{submitting ? <><Spinner /> Submitting</> : 'Submit'}
			</Button>
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

const coreColumns: ColumnDef<any, any>[] = [
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
		enableSorting: true
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
		enableSorting: true
	}
]

const entryExitColumn: ColumnDef<any, any> = {
	id: 'entryExit',
	header: () => <HeaderCell className='text-center' label='Entry/Exit' />,
	accessorKey: 'times',
	enableSorting: false,
	cell: ({ row }) => {
		const record = row.original
		const studentConflicts = record.conflicts || []
		
		return (
			<div className={(studentConflicts.length > 0 ? ' border border-red-500' : '')}>
				{record.times?.map(time => (
					<div className='flex justify-evenly'>
						<div className='text-center flex-1'>{time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
						<div className='text-center flex-1'>{time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
					</div>
				))}
				{studentConflicts.map(conflict => (
					<div className='text-red-500 break-words text-center'>
						Conflict from {conflict.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {conflict.exitTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
					</div>
				))}
			</div>
		)
	}
}

const studentPresentColumn: ColumnDef<StudentRecord, any> = {
	id: 'studentPresent',
	header: () => <HeaderCell label='Student Present' />,
	accessorKey: 'times',
	enableSorting: false,
	cell: ({ row }) => {
		const record = row.original
		return record.times && record.times.length > 0 ? <span className='text-green-500'>Y</span> : <span className='text-red-500'>N</span>
	}
}

const familyAttendColumn: ColumnDef<StudentRecord, any> = {
	id: 'familyAttendance',
	header: () => (
		<HeaderCell label='Family Attendance' className='text-center'>
			<div className='flex flex-wrap w-full'> 
				<span className='w-1/2 text-center text-xs'>Family Member</span>
				<span className='w-1/2 text-center text-xs'>Count</span>
			</div>
		</HeaderCell>
	),
	accessorKey: 'familyAttendance',
	enableSorting: false,
	cell: ({ row }) => {
		const familyAttendanceRecord = row.original.familyAttendance
		return (
			<div className='flex items-center flex-wrap h-full'>
				{
					familyAttendanceRecord.map(fa => (
						<>
							<span className='w-1/2 text-center'>{FamilyMemberOps.toString(fa.familyMember)}</span>
							<span className='w-1/2 text-center'>{fa.count}</span>
						</>
					))
				}
			</div>
		)
	}
}