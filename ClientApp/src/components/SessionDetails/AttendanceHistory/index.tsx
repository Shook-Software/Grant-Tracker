import { useState, useEffect, useRef } from 'react'
import { Accordion } from 'react-bootstrap'

import RecordDisplay from './RecordDisplay'
import AttendanceModal from 'components/SessionAttendance'

import { DayOfWeek } from 'Models/DayOfWeek'
import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { patchAttendanceRecord, deleteAttendanceRecord } from '../api'


interface Props {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
}

export default ({sessionGuid, attendanceRecords, onChange}: Props): JSX.Element => {
  const [modalProps, setModalProps] = useState<any>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!isLoading)
    {
      onChange()
    }
  }, [sessionGuid, isLoading])

  function handleDeleteClick(record) {
    deleteAttendanceRecord(record.guid)
      .then(res => onChange())
  }

  function handleEditClick(record) {
    //set registrations in correct format
    //make sure copies are made, do not modify originals. Spread all arrays, etc
    let studentRecords = record.studentAttendanceRecords.map(record => ({
      isPresent: true,
      attendance: record.timeRecords.map(time => ({
        startTime: time.startTime,
        endTime: time.endTime
      })),
      studentSchoolYear: {
        ...record.studentSchoolYear,
        student: { ...record.studentSchoolYear.student }
      },
      familyAttendance: []
    }))

    let instructorRecords = record.instructorAttendanceRecords.map(record => ({
      isPresent: true,
      attendance: record.timeRecords.map(time => ({
        ...time,
        startTime: time.startTime,
        endTime: time.endTime
      })),
      instructorSchoolYear: {
        ...record.instructorSchoolYear,
        instructor: {...record.instructorSchoolYear.instructor},
        status: {...record.instructorSchoolYear.status}
      }
    }))

    setModalProps({
      date: record.instanceDate,
      dayOfWeek: DayOfWeek.toInt(record.instanceDate.dayOfWeek().toString()),
      studentRecords,
      instructorRecords,
      substituteRecords: [],
      defaultSchedule: studentRecords[0]?.attendance || instructorRecords[0]?.attendance
    })

    setShowModal(true)
  }
  
  return (
    <>
      <h5>Attendance History</h5>
      {attendanceRecords.map((record, index) => {

        return (
            <Accordion className='my-3'>
              <RecordDisplay 
                sessionGuid={sessionGuid} 
                simpleRecord={record} 
                onEditClick={(record) => handleEditClick(record)}
                onDeleteClick={(record) => handleDeleteClick(record)}
              />
              {
                showModal ? 
                <AttendanceModal 
                  props={modalProps}
                  handleClose={() => setShowModal(false)} 
                  handleSubmit={(date, studentRecords, instructorRecords, substituteRecords) => new Promise((resolve, reject) => {
                    const editedRecord = {
                      sessionGuid,
                      date,
                      studentRecords,
                      instructorRecords,
                      substituteRecords
                    }

                    setIsLoading(true)
                    setShowModal(false)
                    patchAttendanceRecord(sessionGuid, record.guid, editedRecord)
                      .then(res => { resolve() })
                      .catch(err => { reject() })
                      .finally(() => { setIsLoading(false) })
                  })}
                />
              : null
              }
            </Accordion>
        )
      })}
    </>
  )
}