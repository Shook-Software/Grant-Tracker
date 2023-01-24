import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { AttendanceTimeRecordView } from 'Models/StudentAttendance'

export default ({timeRecords}: {timeRecords: AttendanceTimeRecordView[]}): JSX.Element => {
  timeRecords = timeRecords.sort((first, second) => {
    if (first.startTime.isBefore(second.startTime))
      return -1
    if (first.endTime.isAfter(second.endTime))
      return 1
    return 0
  })

  return (
    <div className='d-flex align-items-center flex-wrap h-100'>
      { 
        timeRecords.map(record => (
          <>
            <span className='w-50 text-center'>{record.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
            <span className='w-50 text-center'>{record.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}</span>
          </>
        ))
      }
    </div>
  )
}