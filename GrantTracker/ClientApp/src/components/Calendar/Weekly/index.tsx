//no need for state, just feed info in
import {DayView, HourLabels} from './DayView'
import {Container, DayLabel} from './styles'
import {DayOfWeek} from '../../../types/Session'

import {mapEnum} from 'utils/Array'


const createWeek = (startDate: Date): JSX.Element[] => {
  let days: JSX.Element[] = []

  const addDays = (date: Date, days: number): Date => {
    let result = new Date(date)
    result.setDate(date.getDate() + days)
    return result
  }

  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    let currentDay = addDays(startDate, dayIndex)
    days = [...days, <DayView date={currentDay} />]
  }

  return days
}

const getLatestSunday = (currentDate: Date): Date => {
  let day = new Date(currentDate)
  day.setDate(day.getDate() - day.getDay())
  return day
}

//I think we import the start day of a given week with it starting on the Sunday the current week is in
//Then use that to grab and set the rest
export default (props): JSX.Element => {

  const currentDate = new Date('March 10, 2022')
  let latestSunday: Date = getLatestSunday(currentDate)

  return (
    <Container>
      <DayLabel>
        <HourLabels />
      </DayLabel>
      {createWeek(latestSunday)}
    </Container>
  )
}