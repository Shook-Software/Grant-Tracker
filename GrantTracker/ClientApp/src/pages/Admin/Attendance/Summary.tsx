import { ReactElement } from "react";
import { AttendanceForm } from "./state";
import { InstructorRecord, StudentRecord } from "Models/StudentAttendance";
import Table, { Column } from "components/BTable";
import { TimeScheduleForm } from "Models/TimeSchedule";
import { DateTimeFormatter } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";



interface SummaryProps {
	state: AttendanceForm
}

export const AttendanceSummary = ({ state }: SummaryProps): ReactElement => {

	const instructors: InstructorRecord[] = state.instructorRecords.filter(x => x.isPresent && !x.isSubstitute)
	const substitutes: InstructorRecord[] = state.instructorRecords.filter(x => x.isPresent && x.isSubstitute)
	const students: StudentRecord[] = state.studentRecords.filter(x => x.isPresent)

	return (
		<div className='row'>
			<div className='col-lg-6 col-12'>
				<section>
					<h6>Instructors - {instructors.length}</h6>
					<Table dataset={instructors} columns={columns} />
				</section>

				<section className={substitutes.length === 0 ? 'd-none' : ''}>
					<h6>Substitutes - {substitutes.length}</h6>
					<Table dataset={substitutes} columns={columns} />
				</section>

				<section>
					<h6>Students - {students.length}</h6>
					<Table dataset={students} columns={columns} />
				</section>
			</div>

			<div className='col-lg-6 col-12'>
				<section>
					<h6 className='text-secondary'>Everything looks good?</h6>
					<button className='btn btn-secondary' type='button'>Submit</button>
				</section>
			</div>
		</div>
	)
}

const cellProps = {
	style: {
		fontSize: '0.75rem',
		padding: '0.25rem 0.25rem'
	}
}

const columns: Column[] = [
	{
		label: 'Last Name',
		attributeKey: 'lastName',
		sortable: true,
		headerProps: cellProps,
		cellProps: cellProps
	},
	{
		label: 'First Name',
		attributeKey: 'firstName',
		sortable: true,
		headerProps: cellProps,
		cellProps: cellProps
	},
	{
		label: 'Entry/Exit',
		attributeKey: 'times',
		sortable: false,
		transform: (times: TimeScheduleForm[]) => (
			<div>
				{times.map(time => (
					<div className='row'>
						<div className='text-center w-50'>{time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
						<div className='text-center w-50'>{time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}</div>
					</div>
				))}
			</div>
		),
		headerProps: { ...cellProps, className: 'text-center' },
		cellProps: cellProps
	}
]