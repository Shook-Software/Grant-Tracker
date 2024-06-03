import { Card, Button, ListGroup, Row, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import ListItem, { Item } from 'components/Item'
import { DayScheduleView } from 'Models/DaySchedule'
import { SessionView } from 'Models/Session'

import paths from 'utils/routing/paths'
import { DayOfWeek } from 'Models/DayOfWeek'

interface Props {
  session: SessionView
}

export default ({ session }: Props): JSX.Element => {
  const attendanceHref: string = `${paths.Admin.Attendance.path}?session=${session.guid}` 
  return (
    <>
    <Card>
      <Card.Body>
          <Card.Title>Weekly Schedule</Card.Title>
          <ListGroup variant='flush'>
            {session!.daySchedules.map((item: DayScheduleView) => (
              <Item>
                <p>{item.dayOfWeek}</p>
                <div className='d-flex flex-column'>
                  {item.timeSchedules.map(schedule => (
                    <p>
                      {`${schedule.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} 
                      to ${schedule.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}`}
                    </p>
                  ))}
                </div>
                <Link
                  className='btn btn-sm btn-primary'
                  to={attendanceHref + `&dow=${DayOfWeek.toInt(item.dayOfWeek)}`}
                  style={{ height: 'min-content', maxWidth: '30%'}}
                >
                  Attendance
                </Link>
              </Item>
            ))}
          </ListGroup>
      </Card.Body>
    </Card>
    <Card className='mt-3' style={session.blackoutDates.length > 0 ? {} : { display: 'none'}}>
      <Card.Body>
          <Card.Title>Session Blackout Dates</Card.Title>
          <Row>
            {session.blackoutDates.map(blackout => (
              <Col sm={6}>{blackout.date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}</Col>
            ))}
          </Row>
      </Card.Body>
    </Card>
    </>
  )
}
