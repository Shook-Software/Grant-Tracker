import { Link } from 'react-router-dom'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'
import { useQuery } from '@tanstack/react-query'

import { Item } from 'components/Item'
import { DayScheduleView } from 'Models/DaySchedule'
import { SessionView } from 'Models/Session'
import { OrganizationBlackoutDateDomain, OrganizationBlackoutDateView, BlackoutDate } from 'Models/BlackoutDate'

import paths from 'utils/routing/paths'
import { DayOfWeek } from 'Models/DayOfWeek'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarPlus } from 'lucide-react'

interface Props {
  session: SessionView
}

interface CombinedBlackoutDate {
  date: LocalDate
  type: 'session' | 'organization'
}

export default ({ session }: Props): JSX.Element => {
  const attendanceHref: string = `${paths.Admin.Attendance.path}?session=${session.guid}`

  // Fetch organization blackout dates
  const { data: orgBlackoutDates = [] } = useQuery({
    queryKey: [`organization/${session.organizationYear.organization.guid}/blackout`],
    select: (bDates: OrganizationBlackoutDateDomain[]) => bDates.map(bDate => BlackoutDate.toViewModel(bDate)) as OrganizationBlackoutDateView[],
    enabled: !!session.organizationYear.organization.guid
  })

  // Combine and sort blackout dates
  const combinedBlackoutDates: CombinedBlackoutDate[] = [
    ...session.blackoutDates.map(bd => ({ date: bd.date, type: 'session' as const })),
    ...orgBlackoutDates.map(bd => ({ date: bd.date, type: 'organization' as const }))
  ].sort((first, second) => first.date.compareTo(second.date))

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
    {combinedBlackoutDates.length > 0 && (
      <section>
        <h3 className='text-lg font-semibold'>Blackout Dates</h3>
        <div className="flex flex-wrap gap-3 px-4 py-3">
          {combinedBlackoutDates.map((blackout, index) => (
            <div key={`${blackout.type}-${blackout.date.toString()}-${index}`} className="flex items-center gap-2">
              <span className="text-sm">
                {blackout.date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}
              </span>
              <Badge variant={blackout.type === 'session' ? 'default' : 'secondary'}>
                {blackout.type === 'session' ? 'Session' : 'Organization'}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    )}
    </>
  )
}
