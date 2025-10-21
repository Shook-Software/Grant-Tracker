import { DateTimeFormatter } from '@js-joda/core'
import { Locale } from '@js-joda/locale_en-us'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import ListItem from 'components/Item'

import { SessionView } from 'Models/Session'

interface Props {
  session: SessionView
}

export default ({ session }: Props): JSX.Element => {

  let gradesSorted = session.grades?.sort((first, second) => {
    let firstInt: number = first.value == 'KG' ? -1 : parseInt(first.value)
    let secondInt: number = second.value == 'KG' ? -1 : parseInt(second.value)

    if (firstInt > secondInt)
      return 1
    else if (firstInt < secondInt)
      return -1

    return 0
  })

  return (
    <Card className='ps-3'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <ListItem label='Session Type:' value={session!.sessionType.label} />
          <ListItem label='Activity:' value={session!.activity.label} />
          <ListItem
            label='Objective:'
            value={session.objectives.sort((a, b) => (a.abbreviation - b.abbreviation)).map(obj => <div key={obj.abbreviation}>
              {`(${obj.abbreviation}) ${obj.label}`}
              </div>
            )}
          />
          <ListItem label='Funding Source:' value={session!.fundingSource.label} />
          <ListItem label='Organization Type:' value={session!.organizationType.label} />
          <ListItem label='Partnership Type:' value={session!.partnershipType.label} />
          <ListItem
            label='Grade Levels:'
            value={
              <p>
                {gradesSorted?.length
                  ? gradesSorted.map((grade, index) => (index !== gradesSorted.length - 1 ? grade.value + ', ' : grade.value))
                  : 'All Grade Levels'}
              </p>
            }
          />
          <ListItem label='First Session:' value={session.firstSession.format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))} />
          <ListItem label='Last Session:' value={session.lastSession.format(DateTimeFormatter.ofPattern('MMMM d, yyyy').withLocale(Locale.ENGLISH))} />
        </div>
      </CardContent>
    </Card>
  )
}
