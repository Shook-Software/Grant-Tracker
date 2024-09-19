import { useState, useEffect, useContext } from 'react'
import { Accordion } from 'react-bootstrap'

import RecordDisplay from './RecordDisplay'

import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { deleteAttendanceRecord } from '../api'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { OrgYearContext } from 'pages/Admin'
import { Locale } from '@js-joda/locale_en-us'
import api from 'utils/api'


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
      {attendanceRecords && attendanceRecords.length > 0 ? <AttendanceExport sessionGuid={sessionGuid} attendanceRecords={attendanceRecords} /> : <></>}

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

interface ExportProps {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
}

const AttendanceExport = ({sessionGuid, attendanceRecords}: ExportProps): JSX.Element => {
  attendanceRecords.sort((a, b) => a.instanceDate.compareTo(b.instanceDate));
  const { orgYear, setOrgYear } = useContext(OrgYearContext)
  const [startDate, setStartDate] = useState<LocalDate>(attendanceRecords[0].instanceDate);
  const [endDate, setEndDate] = useState<LocalDate>(attendanceRecords[attendanceRecords.length - 1].instanceDate);
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [hasSubmitError, setHasSubmitError] = useState<boolean>(false);

  function downloadExcelReport() {
    setIsDownloading(true);
    setHasSubmitError(false);

    api.get(`session/${sessionGuid}/attendance/export?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob'
    })
    .then(res => {
      const href = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = href;

      let startDateStr: string = startDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
      let endDateStr: string = endDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
      link.setAttribute('download', `${orgYear?.organization.name.replaceAll(' ', '-')}_Attendance_Printout_${startDateStr}-to-${endDateStr}.xlsx`)

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    })
    .catch(err => {
      setHasSubmitError(true);
    })
    .finally(() => {
      setIsDownloading(false);
    })
  }

  return (
    <div style={{fontSize: '16px'}}>
      <div className='row'>
        <div className='col-3'>
          <label htmlFor='export-start-date' className='form-label'><small>Start Date</small></label>
          <input id='export-start-date' className='form-control' type='date' value={startDate.toString()} onChange={(e) => setStartDate(LocalDate.parse(e.target.value))} />
        </div>

        <div className='col-3'>
          <label htmlFor='export-end-date' className='form-label'><small>End Date</small></label>
          <input id='export-end-date' className='form-control' type='date' value={endDate.toString()} onChange={(e) => setEndDate(LocalDate.parse(e.target.value))} />
        </div>

        <div className='col-6 d-flex align-items-end'>
          <button className='btn btn-primary d-flex' type='button' onClick={downloadExcelReport} disabled={isDownloading}>
            {isDownloading ? <div className='spinner-border' /> : 'Export' }
          </button>
        </div>
      </div>

      <div>
          {hasSubmitError ? <div className='text-danger'><small>Something went wrong, please check the dates and try again, or contact an administrator if issues continue.</small></div> : <></>}
      </div>
    </div>
  )
}