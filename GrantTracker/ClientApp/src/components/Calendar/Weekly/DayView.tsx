import {mod} from 'utils/Math'
import {DayOfWeek, MonthOfYear} from '../../../types/Session'
import {Day, ActiveIndicator, ActiveTimeIndicator, Header, Cell, Table, HourLabel} from './styles'

interface DayProps {
  date: Date
  isActive: boolean
  schedule: any
}

const tempArray = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

const isTimeBetween = (start: Date, end: Date, time: Date): boolean => {
  return time >= start && time <= end
}

//date[]
const TimeTable = ({date, activeDatetimes}): JSX.Element => {
  const startHour: number = 6
  const endHour: number = 22
  const step: number = 15

  let cells: JSX.Element[] = []

  const datetime: Date = new Date(date)
  for (let hour = startHour; hour <= endHour; hour++) {
    datetime.setHours(hour)
    let children: JSX.Element[] = []
    for (let minute = 0; minute <= 60; minute = minute + step) {
      datetime.setMinutes(minute)
      children = [...children, <ActiveTimeIndicator isActive={isTimeBetween(start, end, datetime)} />]
    }
    cells = [...cells, <Cell>{children}</Cell>]
  }//start
  //end


  return (
    <Table>
      {cells}
    </Table>
  )
}
export const HourLabels = (): JSX.Element => {
  const hours = tempArray.map(item => {
    const hour: number = mod(item, 12) || 12
    const meridiem: string = item >= 12 ? 'PM' : 'AM'
    return (
      <HourLabel>
        <p>{`${hour}:00 ${meridiem} -`}</p>
      </HourLabel>
    )
  })

  return (
    <>
      {hours}
    </>
  )
}

let start = new Date('March 6, 2022')
start.setHours(12)
start.setMinutes(15)

let end = new Date('March 6, 2022')
end.setHours(15)
end.setMinutes(15)

const tempActiveDates = [
  {
    start: start,
    end: end
  }
]

export const DayView = ({date, isActive, schedule}: DayProps): JSX.Element => {
  const dayOfMonth: number = date.getDate()
  const month: string = MonthOfYear[date.getMonth()]
  const dayOfWeek: string = DayOfWeek[date.getDay()]

  return (
    <Day>
      <Header>
        <ActiveIndicator isActive={false} />
        <p>{`${month} ${dayOfMonth},`}</p>
        <p>{dayOfWeek}</p>
      </Header>
      <TimeTable date={date} activeDatetimes={tempActiveDates}/>
    </Day>
  )
}