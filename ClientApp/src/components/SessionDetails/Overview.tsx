import { Card, ListGroup } from 'react-bootstrap'

import ListItem from 'components/Item'

import { SessionView } from 'models/Session'

interface Props {
  session: SessionView
}

export default ({ session }: Props): JSX.Element => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Overview</Card.Title>
        <ListGroup variant='flush'>
          <ListItem label='Session Type:' value={session!.sessionType.label} />
          <ListItem label='Activity:' value={session!.activity.label} />
          <ListItem label='Objective:' value={session!.objective.label} />
          <ListItem label='Funding Source:' value={session!.fundingSource.label} />
          <ListItem label='Organization Type:' value={session!.organizationType.label} />
          <ListItem label='Partnership Type:' value={session!.partnershipType.label} />
          <ListItem
            label='Grade Levels:'
            value={
              <p>
                {session!.grades?.length
                  ? session!.grades.map((grade, index) => (index !== session!.grades.length - 1 ? grade.value + ', ' : grade.value))
                  : 'All Grade Levels'}
              </p>
            }
          />
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
