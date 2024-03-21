import React, { ReactElement, useState } from 'react'
import { Form, Button, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap'

import { AttendanceForm, ReducerAction } from './state'
import { AttendanceStartTimeInput, AttendanceEndTimeInput } from './TimeComponents'

import Table, { Column, SortDirection } from 'components/BTable'
import SearchStudentsModal from 'components/SessionDetails/SearchStudentsModal'

import type { FamilyRecord, StudentRecord } from 'Models/StudentAttendance'
import FamilyMemberOps, { FamilyMember } from 'Models/FamilyMember'

import api from 'utils/api'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

interface StudentAttendProps {
    orgYearGuid: string
	sessionType: string
	state: AttendanceForm
	dispatch: React.Dispatch<ReducerAction>
}

export const StudentAttendance = ({ orgYearGuid, state, dispatch, sessionType }: StudentAttendProps): ReactElement => {
    const [showModal, setShowModal] = useState<boolean>(false);

    function addStudent(ssy): Promise<void> {
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

    if (sessionType === 'Family') {
        columns[0].label = 'Anyone Present'
        columns = [createFamilyStudentPresenceColumn(dispatch), ...columns]
    }

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

                <button className='btn btn-sm btn-outline-secondary ms-3' type='button' onClick={() => dispatch({type: 'allStudentPresence', payload: false })}>
                    Mark all Absent
                </button>
            </div>

            <Table dataset={state.studentRecords} columns={columns} defaultSort={{ index: 1, direction: SortDirection.Ascending}} />

            <SearchStudentsModal
                orgYearGuid={orgYearGuid}
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
                    e.preventDefault()
                    dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember, count: familyRecord.count - 1 } })
                }}
            >
                -
            </Button>
            <Button
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    console.log('Fired')
                    dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember, count: familyRecord.count + 1 } })
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
        transform: (record: StudentRecord) => <AttendanceStartTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
    },
    {
        key: 'end',
        label: 'Ended at',
        attributeKey: '',
        sortable: false,
        transform: (record: StudentRecord) => <AttendanceEndTimeInput personId={record.id} times={record.times} dispatch={dispatch} />
    }
]

const createParentAttendanceColumn = (dispatch: React.Dispatch<ReducerAction>): Column => ({
    label: 'Family Members',
    attributeKey: '',
    key: 'family',
    sortable: false,
    transform: (record: StudentRecord) => {
        const addFamilyMember = (familyMember: FamilyMember) =>  {
            console.log('fired elsewhere')
            dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid: record.id, familyMember, count: 1 } })
        }

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
                        console.log('this?')
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

const createFamilyStudentPresenceColumn = (dispatch: React.Dispatch<ReducerAction>): Column => ({
    label: 'Student Present',
    attributeKey: '',
    sortable: false,
    transform: (record: StudentRecord) => (
        <div
            role='button'
            className='d-flex justify-content-center align-items-center'
            onClick={() => dispatch({ type: 'familyStudentPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
            style={{ minHeight: '100%' }}
        >
            <Form.Check checked={record.times.length > 0} onChange={(e) => { }} />
        </div>
    ),
    cellProps: {
        style: { height: '1px', padding: '0px' }
    }
})

const createCoreStudentColumns = (dispatch: React.Dispatch<ReducerAction>): Column[] => [
    {
        label: 'Present',
        attributeKey: '',
        sortable: false,
        transform: (record: StudentRecord) => {
            const conflictClass: string = record.conflicts.length > 0 ? 'border border-danger' : '';

            const equalTimes = record.times.filter(x => x.startTime.equals(x.endTime))
            const endBeforeStartTimes = record.times.filter(x => x.endTime.isBefore(x.startTime))
            
            return (
                <>
                    <div
                        role='button'
                        className={`d-flex flex-column justify-content-center align-items-center ${conflictClass}`}
                        onClick={() => dispatch({ type: 'studentPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
                        style={{ minHeight: '100%' }}
                    >
                        <Form.Check checked={record.isPresent} onChange={(e) => { }} />
                        {record.conflicts.map(conflict => (
                            <div className='text-danger text-break' style={{maxWidth: "250px"}}>
                                Conflict from {conflict.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {conflict.exitTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                            </div>
                        ))}
                        {equalTimes.map(time => (
                            <div className='text-danger text-break' style={{maxWidth: "250px"}}>
                                Start and end times cannot be equal. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                            </div>
                        ))}
                        {endBeforeStartTimes.map(time => (
                            <div className='text-danger text-break' style={{maxWidth: "250px"}}>
                                End time cannot be before start. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                            </div>
                        ))}
                    </div>
                </>
            )
        },
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