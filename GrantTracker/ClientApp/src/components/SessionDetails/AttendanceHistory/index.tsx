import { useState, useEffect } from 'react'
import { Accordion } from 'react-bootstrap'

import RecordDisplay from './RecordDisplay'

import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { deleteAttendanceRecord } from '../api'


interface Props {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
  sessionType: string
}

export default ({sessionGuid, attendanceRecords, onChange, sessionType}: Props): JSX.Element => {
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
  
  return (
    <>
      <h5>Attendance History</h5>
      {attendanceRecords.map((record, index) => {
        return (
            <Accordion className='my-3'>
              <RecordDisplay 
                sessionGuid={sessionGuid} 
                simpleRecord={record} 
                onDeleteClick={(record) => handleDeleteClick(record)}
                sessionType={sessionType}
              />
            </Accordion>
        )
      })}
    </>
  )
}