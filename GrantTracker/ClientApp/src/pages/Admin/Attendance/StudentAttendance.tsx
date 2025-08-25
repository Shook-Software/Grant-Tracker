import React, { ReactElement, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

import { AttendanceForm, ReducerAction } from './state'
import { AttendanceStartTimeInput, AttendanceEndTimeInput } from './TimeComponents'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from 'components/ui/table'
import SearchStudentsModal from 'components/SessionDetails/SearchStudentsModal'

import type { FamilyRecord, StudentRecord } from 'Models/StudentAttendance'
import FamilyMemberOps, { FamilyMember } from 'Models/FamilyMember'

import api from 'utils/api'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { Button } from '@/components/ui/button'

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

    let columns: ColumnDef<StudentRecord, any>[] = createCoreStudentColumns(dispatch)

    if (sessionType === 'Family') {
        columns[0].header = 'Anyone Present'
        columns = [createFamilyStudentPresenceColumn(dispatch), ...columns]
    }

    if (sessionType !== 'Parent')
        columns = [...columns, ...createTimeEntryColumns(dispatch)]

    if (sessionType === 'Parent' || sessionType === 'Family')
        columns = [...columns, createParentAttendanceColumn(dispatch)]

    return (
        <div>
            <div className='mb-3'>
                <Button variant="outline" onClick={() => setShowModal(true)}>
                    Add Student
                </Button>

                <Button variant="outline" onClick={() => dispatch({type: 'allStudentPresence', payload: false })}>
                    Mark all Absent
                </Button>
            </div>

            <DataTable data={state.studentRecords} columns={columns} initialSorting={[{ id: 'lastName', desc: false }]} className='text-sm' containerClassName='w-full overflow-x-auto' />

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
        <div className='flex items-center my-1 text-sm border border-gray-300 rounded overflow-hidden'>
            <div className='flex-1 px-3 py-2 bg-gray-50 border-r border-gray-300'>{FamilyMemberOps.toString(familyRecord.familyMember)}</div>
            <div className='px-3 py-2 bg-gray-50 border-r border-gray-300'>{familyRecord.count}</div>
            <button
                className='px-3 py-2 bg-blue-500 text-white hover:bg-blue-600'
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember, count: familyRecord.count - 1 } })
                }}
            >
                -
            </button>
            <button
                className='px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 border-l border-blue-400'
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid, familyMember: familyRecord.familyMember, count: familyRecord.count + 1 } })
                }}
            >
                +
            </button>
        </div>
    )
}

const createTimeEntryColumns = (dispatch: React.Dispatch<ReducerAction>): ColumnDef<StudentRecord, any>[] => [
    {
        id: 'start',
        header: () => <HeaderCell label='Started at' />,
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }) => <AttendanceStartTimeInput personId={row.original.id} times={row.original.times} dispatch={dispatch} />
    },
    {
        id: 'end',
        header: () => <HeaderCell label='Ended at' />,
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }) => <AttendanceEndTimeInput personId={row.original.id} times={row.original.times} dispatch={dispatch} />
    }
]

const createParentAttendanceColumn = (dispatch: React.Dispatch<ReducerAction>): ColumnDef<StudentRecord, any> => ({
    id: 'family',
    header: () => <HeaderCell label='Family Members' />,
    accessorKey: 'familyAttendance',
    enableSorting: false,
    cell: ({ row }) => {
        const record = row.original
        const addFamilyMember = (familyMember: FamilyMember) =>  {
            dispatch({ type: 'setFamilyMemberCount', payload: { studentSchoolYearGuid: record.id, familyMember, count: 1 } })
        }

        return (
            <div className='relative'>
                <div>
                    {
                        record.familyAttendance.map(fa => (
                            <FamilyInput familyRecord={fa} studentSchoolYearGuid={record.id} dispatch={dispatch} />
                        ))
                    }
                </div>
                <div className='relative inline-block text-left self-center'>
                    <select 
                        className='px-3 py-1 text-sm border border-gray-300 bg-white rounded appearance-none cursor-pointer'
                        onChange={(e) => {
                            if (e.target.value) {
                                addFamilyMember(Number(e.target.value) as FamilyMember)
                                e.target.value = ''
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                        }}
                    >
                        <option value=''>Add Family Member</option>
                        <option value={FamilyMember.Mother}>Mother</option>
                        <option value={FamilyMember.Father}>Father</option>
                        <option value={FamilyMember.Guardian}>Guardian</option>
                        <option value={FamilyMember.Grandma}>Grandmother</option>
                        <option value={FamilyMember.Grandfather}>Grandfather</option>
                        <option value={FamilyMember.OtherAdult}>Other Adult</option>
                    </select>
                </div>
            </div>
        )
    }
})

const createFamilyStudentPresenceColumn = (dispatch: React.Dispatch<ReducerAction>): ColumnDef<StudentRecord, any> => ({
    id: 'studentPresent',
    header: () => <HeaderCell label='Student Present' />,
    accessorKey: 'times',
    enableSorting: false,
    cell: ({ row }) => {
        const record = row.original
        return (
            <div
                role='button'
                className='flex justify-center items-center'
                onClick={() => {
                    let isPresent: boolean = record.times.length != 0
                    dispatch({ type: 'familyStudentPresence', payload: { guid: record.id, isPresent: !isPresent } })
                }}
                style={{ minHeight: '100%' }}
            >
                <Checkbox checked={record.times?.length > 0} onCheckedChange={() => {}} />
            </div>
        )
    }
})

const createCoreStudentColumns = (dispatch: React.Dispatch<ReducerAction>): ColumnDef<StudentRecord, any>[] => [
    {
        id: 'present',
        header: () => <HeaderCell label='Present' />,
        accessorKey: 'isPresent',
        enableSorting: false,
        meta: {
            filter: false
        },
        cell: ({ row }) => {
            const record = row.original
            const conflictClass: string = record.conflicts.length > 0 ? 'border border-red-500' : '';

            const equalTimes = record.times?.filter(x => x.startTime.equals(x.endTime)) || []
            const endBeforeStartTimes = record.times?.filter(x => x.endTime.isBefore(x.startTime)) || []
            
            return (
                <div
                    role='button'
                    className={`flex flex-col justify-center items-center ${conflictClass}`}
                    onClick={() => dispatch({ type: 'studentPresence', payload: { guid: record.id, isPresent: !record.isPresent } })}
                    style={{ minHeight: '100%' }}
                >
                    <Checkbox checked={record.isPresent} onCheckedChange={() => {}} />
                    {record.conflicts.map(conflict => (
                        <div className='text-red-500 break-words' style={{maxWidth: "250px"}}>
                            Conflict from {conflict.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {conflict.exitTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                        </div>
                    ))}
                    {equalTimes.map(time => (
                        <div className='text-red-500 break-words' style={{maxWidth: "250px"}}>
                            Start and end times cannot be equal. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                        </div>
                    ))}
                    {endBeforeStartTimes.map(time => (
                        <div className='text-red-500 break-words' style={{maxWidth: "250px"}}>
                            End time cannot be before start. {time.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} to {time.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}
                        </div>
                    ))}
                </div>
            )
        }
    },
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
        enableSorting: true,
        meta: {
            filter: true
        },
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
    },
    {
        id: 'matricNumber',
        header: ({ column }) => (
            <HeaderCell 
                label='Matric Number'
                sort={column.getIsSorted() === "asc" ? "asc" : column.getIsSorted() === "desc" ? "desc" : false}
                onSortClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            />
        ),
        accessorKey: 'matricNumber',
        enableSorting: true
    },
]