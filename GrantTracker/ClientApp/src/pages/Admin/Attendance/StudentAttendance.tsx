import React, { ReactElement, useState } from 'react'
import { Row, Form, Button, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap'

import { ReducerAction } from './state'
import { AttendanceStartTimeInput, AttendanceEndTimeInput } from './TimeComponents'

import Table, { Column, SortDirection } from 'components/BTable'
import SearchStudentsModal from 'components/SessionDetails/SearchStudentsModal'

import type { FamilyRecord, StudentRecord } from 'Models/StudentAttendance'
import FamilyMemberOps, { FamilyMember } from 'Models/FamilyMember'

import api from 'utils/api'


export const StudentAttendance = ({ orgYearGuid, state, dispatch, sessionType }): ReactElement => {
    const [showModal, setShowModal] = useState<boolean>(false);

    console.log(state.studentRecords, sessionType)

    function addStudent(ssy): Promise<void> {
        console.log(ssy)

        let student = {
            firstName: ssy.student.firstName,
            lastName: ssy.student.lastName,
            matricNumber: ssy.student.matricNumber,
            grade: ssy.grade
        }

        return api.post(`student?orgYearGuid=${orgYearGuid}`, student)
            .then(res => {
                dispatch({ type: 'addStudent', payload: { ...student, guid: res.data } })
            })
    }

    let columns: Column[] = createCoreStudentColumns(dispatch)

    if (sessionType !== 'Parent')
        columns = [...columns, ...createTimeEntryColumns(dispatch)]

    if (sessionType === 'Parent' || sessionType === 'Family')
        columns = [...columns, createParentAttendanceColumn(dispatch)]

    return (
        <div>
            <div className='mb-3'>
                <button className='btn btn-sm btn-outline-secondary' type='button' onClick={() => setShowModal(true)}>
                    Add Student
                </button>
            </div>

            <Table dataset={state.studentRecords} columns={columns} defaultSort={{ index: 1, direction: SortDirection.Ascending}} />

            <SearchStudentsModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleChange={({ student, _ }) => addStudent(student)}
                scheduling={null}
            />
        </div>
    )
}


const FamilyInput = ({ familyRecord, studentSchoolYearGuid, dispatch }: { familyRecord: FamilyRecord, studentSchoolYearGuid: string, dispatch: any }): JSX.Element => {
    return (
        <InputGroup size='sm' className='my-1'>
            <InputGroup.Text as='div' className='flex-fill'>{FamilyMemberOps.toString(familyRecord.familyMember)}</InputGroup.Text>
            <InputGroup.Text as='div'>{familyRecord.count}</InputGroup.Text>
            <Button
                onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: 'removeFamilyMember', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember } })
                }}
            >
                -
            </Button>
            <Button
                onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: 'addFamilyMember', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember } })
                }}
            >
                +
            </Button>
        </InputGroup>
    )
}

const createTimeEntryColumns = (dispatch: React.Dispatch<ReducerAction>): Column[] => [
    {
        key: 'start',
        label: 'Started at',
        attributeKey: '',
        sortable: false,
        transform: (record: StudentRecord) =>
            <AttendanceStartTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
    },
    {
        key: 'end',
        label: 'Ended at',
        attributeKey: '',
        sortable: false,
        transform: (record: StudentRecord) =>
            <AttendanceEndTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
    }
]

const createParentAttendanceColumn = (dispatch: React.Dispatch<ReducerAction>): Column => ({
    label: 'Family Members',
    attributeKey: '',
    key: 'family',
    sortable: false,
    transform: (record: StudentRecord) => {
        const addFamilyMember = (familyMember: FamilyMember) => dispatch({ type: 'addFamilyMember', payload: { studentSchoolYearGuid: record.id, familyMember } })

        return (
            <>
                <div>
                    {
                        record.familyAttendance.map(fa => (
                            <FamilyInput familyRecord={fa} studentSchoolYearGuid={record.id} dispatch={dispatch} />
                        ))
                    }
                </div>
                <DropdownButton
                    title={'Add Family Member'}
                    size='sm'
                    className='align-self-center'
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                    }}
                >
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Mother)}>Mother</Dropdown.Item>
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Father)}>Father</Dropdown.Item>
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Guardian)}>Guardian</Dropdown.Item>
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Grandma)}>Grandmother</Dropdown.Item>
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.Grandfather)}>Grandfather</Dropdown.Item>
                    <Dropdown.Item href='#' onClick={() => addFamilyMember(FamilyMember.OtherAdult)}>Other Adult</Dropdown.Item>
                </DropdownButton>
            </>
        )
    }
})

const createCoreStudentColumns = (dispatch: React.Dispatch<ReducerAction>): Column[] => [
    {
        label: 'Present',
        attributeKey: '',
        sortable: false,
        transform: (record: StudentRecord) => (
            <div
                role='button'
                className='d-flex justify-content-center align-items-center'
                onClick={() => dispatch({ type: 'studentPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
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
        attributeKey: 'lastName',
        sortable: true
    },
    {
        label: 'First Name',
        attributeKey: 'firstName',
        sortable: true
    },
    {
        label: 'Matric Number',
        attributeKey: 'matricNumber',
        sortable: true
    },
]