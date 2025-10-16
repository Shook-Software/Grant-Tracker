import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { Badge } from '@/components/ui/badge'

import { AttendanceTimeRecordView } from 'Models/StudentAttendance'

export default ({timeRecords}: {timeRecords: AttendanceTimeRecordView[]}): JSX.Element => {
  timeRecords = timeRecords?.sort((first, second) => {
    if (first.startTime.isBefore(second.startTime))
      return -1
    if (first.endTime.isAfter(second.endTime))
      return 1
    return 0
  }) || []

  return (
    <div className='flex flex-col space-y-2 min-h-full min-w-[200px]'>
      { 
        timeRecords.map((record, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Badge variant="secondary" className="font-normal text-xs">
              {record.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}
            </Badge>
            <span className="text-muted-foreground text-xs">to</span>
            <Badge variant="secondary" className="font-normal text-xs">
              {record.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))}
            </Badge>
          </div>
        ))
      }
    </div>
  )
}