import React, { ReactElement, useState } from "react"
import Table, { Column } from "components/BTable";

import { InstructorRecord } from "Models/StudentAttendance";

import { AttendanceStartTimeInput, AttendanceEndTimeInput } from './TimeComponents'
import { AttendanceForm, ReducerAction } from './state'
import { Form } from "react-bootstrap";
import AddInstructorModal from "components/Modals/AddInstructorModal";

import api from 'utils/api'


interface IAttendProps {
	orgYearGuid: string
	state: AttendanceForm
	dispatch: React.Dispatch<ReducerAction>
}

export const InstructorAttendance = ({ orgYearGuid, state, dispatch }: IAttendProps): ReactElement => {
	const [showAddModal, setShowAddModal] = useState(false)

	const iColumns = createInstructorColumns(dispatch)

	function addInternalInstructor(instructor, instructorSchoolYearGuid: string): Promise<ApiResult> {
		console.log(instructor)

		return api.post(`instructor/add?organizationYearGuid=${orgYearGuid}`, {
			firstName: instructor.firstName.trim(),
			lastName: instructor.lastName.trim(),
			badgeNumber: instructor.badgeNumber.trim(),
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

	function addExternalInstructor(instructor): Promise<ApiResult> {
		console.log(instructor)

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
				<button className='btn btn-sm btn-outline-secondary' type='button' onClick={() => setShowAddModal(true)}>
					Add Instructor
				</button>
			</div>

			<Table dataset={state.instructorRecords} columns={iColumns} />

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


const createInstructorColumns = (dispatch: React.Dispatch<ReducerAction>): Column[] => [
	{
        label: 'Present',
        attributeKey: '',
        sortable: false,
        transform: (record: InstructorRecord) => (
            <div
                role='button'
                className='d-flex justify-content-center align-items-center'
                onClick={() => dispatch({ type: 'instructorPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
                style={{ minHeight: '100%' }}
            >
                <Form.Check checked={record.isPresent} onChange={(e) => { }} />
            </div>
        ),
        cellProps: {
            style: { height: '1px', padding: '0px' }
        }
    },
	{
		label: 'Last Name',
		attributeKey: '',
		sortable: true,
		transform: (record: InstructorRecord) => <span className={record.isSubstitute ? 'text-secondary' : ''}>{record.lastName}</span>
	},
	{
		label: 'First Name',
		attributeKey: '',
		sortable: true,
		transform: (record: InstructorRecord) => <span className={record.isSubstitute ? 'text-secondary' : ''}>{record.firstName}</span>
	},
	{
		key: 'start',
		label: 'Started at',
		attributeKey: '',
		sortable: false,
		transform: (record: InstructorRecord) =>
			<AttendanceStartTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
	},
	{
		key: 'end',
		label: 'Ended at',
		attributeKey: '',
		sortable: false,
		transform: (record: InstructorRecord) =>
			<AttendanceEndTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
	}
]
