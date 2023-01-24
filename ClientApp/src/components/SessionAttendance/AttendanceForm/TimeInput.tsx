import { LocalTime } from '@js-joda/core'

import { TimeInput } from 'components/TimeRangeSelector'

export interface AttendanceRecord {
  personSchoolYearGuid: string
  startTime: LocalTime
  endTime: LocalTime
}

export enum TimeInputType {
  Start = 0,
  End = 1
}

interface TimeProps {
  id: string,
  records: AttendanceRecord[]
  inputType: TimeInputType
  onChange: (personGuid: string, time: LocalTime, index: number | undefined) => void
}

export default ({id, records, inputType, onChange, ...props}: TimeProps): JSX.Element => {
  if (inputType !== TimeInputType.Start && inputType !== TimeInputType.End) {
    throw new Error('Invalid parameter supplied to inputType for TimeInput.')
  }


  return (
    <div style={{ width: 'fit-content' }}>
      {records?.map((record, index) => (
        <>
          <TimeInput
            key={id}
            id={id}
            value={inputType == TimeInputType.Start ? record.startTime : record.endTime}
            onChange={(value: LocalTime) => onChange(record.personSchoolYearGuid, value, index)}
            {...props}
          />
          {index !== records.length - 1 ? <hr /> : null}
        </>
      ))}    
    </div>
  )
}