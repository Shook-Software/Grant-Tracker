import { Link, useNavigate } from 'react-router-dom'
import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import ListItem, { Item } from 'components/Item'
import { DayScheduleView } from 'Models/DaySchedule'
import { SessionView } from 'Models/Session'

import paths from 'utils/routing/paths'
import { DayOfWeek } from 'Models/DayOfWeek'
import { Button } from '../ui/button'
import { CalendarPlus } from 'lucide-react'

interface Props {
  session: SessionView
}

export default ({ session }: Props): JSX.Element => {
  const attendanceHref: string = `${paths.Admin.Attendance.path}?session=${session.guid}` 
  return (
    <>
    <section className='mb-6'>
      <h3 className='text-lg font-semibold'>Weekly Schedule</h3>
      <div className='space-y-2'>
        {session!.daySchedules.map((item: DayScheduleView) => (
          <Item className='flex items-center'>
            <p className='font-semibold'>{item.dayOfWeek}</p>
            <div className='flex gap-3 items-center'>
              <div className='flex flex-col'>
                {item.timeSchedules.map(schedule => (
                  <p>
                    {`${schedule.startTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))} 
                    to ${schedule.endTime.format(DateTimeFormatter.ofPattern('hh:mm a').withLocale(Locale.ENGLISH))}`}
                  </p>
                ))}
              </div>
              <Button variant='outline' size='sm' asChild aria-label={`Take attendance for ${item.dayOfWeek}`}>
                <Link className='max-w-12' to={attendanceHref + `&dow=${DayOfWeek.toInt(item.dayOfWeek)}`}>
                    <CalendarPlus />
                </Link>
              </Button>
            </div>
          </Item>
        ))}
      </div>
    </section>
    {session.blackoutDates.length > 0 && (
      <section>
        <h3 className='text-lg font-semibold'>Session Blackout Dates</h3>
        <div className="flex justify-between px-4 py-3">
          {session.blackoutDates.sort((first, second) => first.date.isBefore(second.date) ? 1 : -1).map(blackout => (
            <div key={blackout.date.toString()} className="text-sm">
              {blackout.date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}
            </div>
          ))}
        </div>
      </section>
    )}
    </>
  )
}
