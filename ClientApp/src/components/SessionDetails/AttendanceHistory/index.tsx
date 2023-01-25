import { useState, useEffect, useRef } from 'react'
import { Accordion } from 'react-bootstrap'
import { LocalTime } from '@js-joda/core'

import RecordDisplay from './RecordDisplay'
import AttendanceModal from 'components/SessionAttendance'

import { DayOfWeek } from 'Models/DayOfWeek'
import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { patchAttendanceRecord, deleteAttendanceRecord } from '../api'


interface Props {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
  isFamilySession: boolean
}

export default ({sessionGuid, attendanceRecords, onChange, isFamilySession}: Props): JSX.Element => {
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

    console.warn('editing record:', record.guid)
    //set registrations in correct format
    //make sure copies are made, do not modify originals. Spread all arrays, etc
    let studentRecords = record.studentAttendanceRecords?.map(record => ({
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
    })) || []

    let instructorRecords = record.instructorAttendanceRecords?.map(record => ({
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
    })) || []


    //find the most common start and end times 
    let meanTimeRecords: {startTime: LocalTime, endTime: LocalTime}[] = []
    if (studentRecords.length > 0 && studentRecords[0].attendance?.length > 0) {
      const createKey = (time: LocalTime): string => `${time.hour()}-${time.minute()}}`
      let startTimeMapArray: Map<string, number>[] = studentRecords[0].attendance.map(_ => new Map<string, number>())
      let endTimeMapArray: Map<string, number>[] = studentRecords[0].attendance.map(_ => new Map<string, number>())
  
      studentRecords.forEach(rec => {
        rec.attendance.forEach((time, index) => {
          const startKey: string = createKey(time.startTime)
          const endKey: string = createKey(time.endTime)

          startTimeMapArray[index].set(startKey, (startTimeMapArray[index].get(startKey) || 0) + 1)
          endTimeMapArray[index].set(endKey, (endTimeMapArray[index].get(endKey) || 0) + 1)
        })
      })

      for (let index = 0; index < startTimeMapArray.length; index++) {
        let highestStartFrequency: number = 0
        let highestEndFrequency: number = 0
        let highestFrequencyStartKey: string = ""
        let highestFrequencyEndKey: string = ""

        startTimeMapArray[index].forEach((value, key) => {
          if (value > highestStartFrequency)
            highestStartFrequency = value
          highestFrequencyStartKey = key
        })

        endTimeMapArray[index].forEach((value, key) => {
          if (value > highestEndFrequency)
            highestEndFrequency = value
          highestFrequencyEndKey = key
        })

        let startTimeSplit: string[] = highestFrequencyStartKey.split('-')
        let endTimeSplit: string[] = highestFrequencyEndKey.split('-')

        meanTimeRecords = [...meanTimeRecords, {
          startTime: LocalTime.of(parseInt(startTimeSplit[0]), parseInt(startTimeSplit[1])),
          endTime: LocalTime.of(parseInt(endTimeSplit[0]), parseInt(endTimeSplit[1]))
        }]
      }
    }

    setModalProps({
      attendanceGuid: record.guid,
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
            </Accordion>
        )
      })}
      {
        showModal ? 
        <AttendanceModal 
          props={modalProps}
          isFamilySession={isFamilySession}
          handleClose={() => setShowModal(false)} 
          handleSubmit={(attendanceGuid, date, studentRecords, instructorRecords, substituteRecords) => new Promise((resolve, reject) => {
            const editedRecord = {
              sessionGuid,
              date,
              studentRecords,
              instructorRecords,
              substituteRecords
            }

            setIsLoading(true)
            setShowModal(false)
            patchAttendanceRecord(sessionGuid, attendanceGuid, editedRecord)
              .then(res => { resolve() })
              .catch(err => { reject() })
              .finally(() => { setIsLoading(false) })
          })}
        />
      : null
      }
    </>
  )
}