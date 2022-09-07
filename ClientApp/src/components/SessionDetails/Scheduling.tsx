import { Card, Button, ListGroup } from 'react-bootstrap'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import ListItem, { Item } from 'components/Item'
import { DayScheduleView } from 'models/DaySchedule'
import { SessionView } from 'Models/Session'

interface Props {
  session: SessionView
  onClick
}

export default ({ session, onClick }: Props): JSX.Element => {
  return (
    <Card>
      <Card.Body>
        {session!.recurring ? (
          <>
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
                  <Button
                    size='sm'
                    style={{ height: 'min-content', maxWidth: '30%'}}
                    onClick={() => {
                      onClick({ show: true, schedule: item })
                    }}
                  >
                    Attendance
                  </Button>
                </Item>
              ))}
            </ListGroup>
          </>
        ) : (
          <>
            <Card.Title>Schedule</Card.Title>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListItem
                  label='Session Date:'
                  value={session!.firstSession.format(DateTimeFormatter.ofPattern('MMMM, dd').withLocale(Locale.ENGLISH))}
                />
                <ListItem
                  label={`Time${session!.daySchedules[0]?.timeSchedules.length > 1 ? 's' : ''} of day:`}
                  value={
                    <p>
                      {session!.daySchedules[0]?.timeSchedules.map(timeSchedule => (
                        <div>
                          {`${timeSchedule.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} 
                          to ${timeSchedule.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}`}
                        </div>
                      ))}
                    </p>
                  }
                />
              </ListGroup>
            </Card.Body>
          </>
        )}
      </Card.Body>
    </Card>
  )
}
