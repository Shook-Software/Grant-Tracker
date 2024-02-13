import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Accordion } from 'react-bootstrap'

import RecordDisplay from './RecordDisplay'
import AttendanceModal from 'components/SessionAttendance'

import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { patchAttendanceRecord, deleteAttendanceRecord } from '../api'


interface Props {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
  sessionType: string
}

export default ({sessionGuid, attendanceRecords, onChange, sessionType}: Props): JSX.Element => {
  const navigate = useNavigate()
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
    navigate(`/attendance?session=${sessionGuid}&attendanceId=${record.guid}`)
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
                sessionType={sessionType}
              />
            </Accordion>
        )
      })}
      {
        showModal ? 
        <AttendanceModal 
          props={modalProps}
          sessionType={sessionType}
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