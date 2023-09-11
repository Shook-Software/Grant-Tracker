import { Card, ListGroup } from 'react-bootstrap'

export default ({ session }): JSX.Element => {
  return (
    <Card className='mt-3'>
      <Card.Body>
        <Card.Title>Instructors</Card.Title>
        <ListGroup variant='flush' className='d-flex flex-row flex-wrap'>
          {session!.instructors.map(isy => (
            <div className='w-50'>
              <ListGroup.Item className='text-center'>{`${isy.instructor.firstName} ${isy.instructor.lastName}`}</ListGroup.Item>
            </div>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
