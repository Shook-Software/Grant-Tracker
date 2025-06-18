import { useState, useEffect, useContext } from 'react'
import { Accordion } from 'react-bootstrap'
import { Locale } from '@js-joda/locale_en-us'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { QueryClient, useQuery } from '@tanstack/react-query'

import RecordDisplay from './RecordDisplay'

import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { PayPeriod } from 'Models/PayPeriod'
import { DateOnly } from 'Models/DateOnly'
import { OrgYearContext } from 'pages/Admin'
import { deleteAttendanceRecord } from '../api'
import api from 'utils/api'
import { AppContext } from 'App'


interface Props {
  sessionGuid: string
  sessionName: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
  sessionType: string
}

export default ({sessionGuid, sessionName, attendanceRecords, onChange, sessionType}: Props): JSX.Element => {
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
                sessionName={sessionName}
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
	const { data } = useContext(AppContext)
  const { orgYear, setOrgYear } = useContext(OrgYearContext)
  const [payPeriod, setPayPeriod] = useState<PayPeriod | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [hasSubmitError, setHasSubmitError] = useState<boolean>(false);

  function downloadExcelReport() {
    if (!payPeriod)
      return;

    setIsDownloading(true);
    setHasSubmitError(false);

    api.get(`session/${sessionGuid}/attendance/export?startDate=${payPeriod.startDate}&endDate=${payPeriod.endDate}`, {
      responseType: 'blob'
    })
    .then(res => {
      const href = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = href;

      let startDateStr: string = payPeriod.startDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
      let endDateStr: string = payPeriod.endDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
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

  const payrollPeriods = data.payrollYears.filter(py => py.years.some(y => y.yearGuid == orgYear?.year.guid)).flatMap(py => py.periods)

  let firstAttendanceDate = attendanceRecords[0].instanceDate;
  let lastAttendanceDate = attendanceRecords[attendanceRecords.length - 1].instanceDate;
  
  return (
    <div style={{fontSize: '16px'}}>
      <div className='row'>
        <div className='col-6'>
          <label htmlFor='export-pay-period' className='form-label'><small>Pay Period</small></label>
          <select id='export-pay-period' className='form-select' value={payPeriod?.period} onChange={(e) => setPayPeriod(payrollPeriods.find(p => p.period.toString() == e.target.value.toString()))}>
            <option value={undefined}></option>
            {payrollPeriods
              .filter((p: PayPeriod) => p.startDate.isEqual(firstAttendanceDate) || p.startDate.isBefore(lastAttendanceDate))
              .filter((p: PayPeriod) => p.endDate.isEqual(lastAttendanceDate) || p.endDate.isAfter(firstAttendanceDate))
              .map(p => <option value={p.period}>{p.startDate.toString()} to {p.endDate.toString()}</option>)}
          </select>
        </div>

        <div className='col-6 d-flex align-items-end'>
          <button className='btn btn-primary d-flex' type='button' onClick={downloadExcelReport} disabled={isDownloading || !payPeriod}>
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