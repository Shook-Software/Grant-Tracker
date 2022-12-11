import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { AttendanceTimeRecordView } from 'Models/StudentAttendance'

export default ({timeRecords}: {timeRecords: AttendanceTimeRecordView[]}): JSX.Element => {
  timeRecords = timeRecords.sort((first, second) => {
    if (first.entryTime.isBefore(second.entryTime))
      return -1
    if (first.entryTime.isAfter(second.entryTime))
      return 1
    return 0
  })

  return (
    <div className='d-flex align-items-center flex-wrap h-100'>
      { 
        timeRecords.map(record => (
          <>
            <span className='w-50 text-center'>{record.entryTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
            <span className='w-50 text-center'>{record.exitTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
          </>
        ))
      }
    </div>
  )
}