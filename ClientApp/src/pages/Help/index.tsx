import { Col, Container, ListGroup, Row, Tab } from 'react-bootstrap'
import { PageContainer } from 'styles'

export default ({ }) => {
  document.title = 'GT - Help'

  return (
    <PageContainer className='p-3'>
      <Container>
        <h3>FAQ</h3>
        <h6>{'(to be updated frequently)'}</h6>
        <ListGroup as='ul'>
          <ListGroup.Item as='li'>
            <div>
              <div className="fw-bold">
                <span className='px-3'>●</span>
                How do I make sessions?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Sessions can be added under Admin, on the tab labeled 'Sessions'. Here you can view your site's sessions, filter them, and create new ones.
              </div>
            </div>
          </ListGroup.Item>
          <ListGroup.Item as='li'>
            <div>
              <div className="fw-bold">
                <span className='px-3'>●</span>
                I can't find instructors to add to a session, how do I add instructors?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Instructors are added to a site in the Instructors tab of the Admin page. Since instructors need a status for reporting purposes, they
                must be added in this manner before they can be used in a Session. In future versions, instructors may be added from the session creation page.
              </div>
            </div>
          </ListGroup.Item>
          <ListGroup.Item as='li'>
            <div>
              <div className="fw-bold">
                <span className='px-3'>●</span>
                How do I view a single session's details?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                This can be accessed through Admin, on the tab labeled 'Sessions'. From your site's sessions, hit view
                on the on you would like to view details for. This should redirect you to the information page.
              </div>
            </div>
          </ListGroup.Item>
          <ListGroup.Item as='li'>
            <div>
              <div className="fw-bold">
                <span className='px-3'>●</span>
                How do I take attendance?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Attendance is handled from a session's information page, on the right-hand side.
                <br />(Note: Attendance for non-recurring sessions has bugs that will be addressed this week. However, a majority of sessions are recurring on a weekly basis.)
              </div>
            </div>
          </ListGroup.Item>
          <ListGroup.Item as='li'>
            <div>
              <div className="fw-bold">
                <span className='px-3'>●</span>
                How do I add students to a session?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Students may be added from a session's information page, in the 'Students' section. Hit 'Add', then search for students.
                For recurring sessions, the students must have specific weekdays selected at the bottom of the search menu.
              </div>
            </div>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup.Item as='li'>
          <div>
            <div className="fw-bold">
              <span className='px-3'>●</span>
              Where is the Reporting page? Why can't I see anything on it?
            </div>
            <div style={{ marginLeft: '2.5rem' }}>
              The reporting page is currently under construction, with the ability to record sessions and attendance taking priority.
            </div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item as='li'>
          <div>
            <div className="fw-bold">
              <span className='px-3'>●</span>
              Help! Something isn't working correctly, what do I do?
            </div>
            <div style={{ marginLeft: '2.5rem' }}>
              Please report your issue to ethan.shook2@tusd1.org, with all relevant details so that the underlying cause of the issue may be ascertained..
              I will address the issue to be fixed in the next update.
            </div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item as='li'>
          <div>
            <div className="fw-bold">
              <span className='px-3'>●</span>
              I don't see my question listed.
            </div>
            <div style={{ marginLeft: '2.5rem' }}>
              If there is a pressing question, please feel free to email ethan.shook2@tusd1.org.
              I will address the question, and possibly add it to this FAQ.
            </div>
          </div>
        </ListGroup.Item>
      </Container>



      <Container className='my-3'>
        <h3>Changelog</h3>
        <h6>Version 1.1.1 - June 6th, 2022</h6>
        <Tab.Container defaultActiveKey='/home/help#fixes'>
          <Row>
            <Col>
              <ListGroup>
                <ListGroup.Item action href='/home/help#fixes'>
                  Fixes
                </ListGroup.Item>
                <ListGroup.Item action href='/home/help#additions'>
                  Additions
                </ListGroup.Item>
                <ListGroup.Item action href='/home/help#todo'>
                  Next Update To-Do
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col>
              <Tab.Content>

                <Tab.Pane eventKey='/home/help#fixes'>
                  <ListGroup>
                    <ListGroup.Item>
                      {'Fixed navigation bar not properly highlighting the current location when under a child path. Example URL (Admin => Admin/Sessions)'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Fixed unnecessary repeated API call on Session Details pages.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Fixed student grades to display as their actual grade, rather than Synergy grade values.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Non-recurring session functionality improved.
                    </ListGroup.Item>
                  </ListGroup>

                </Tab.Pane>

                <Tab.Pane eventKey='/home/help#additions'>
                  <ListGroup>
                    <ListGroup.Item>
                      Added the ability for sessions to be split into multiple sections on the same day (This required an extensive rewrite).
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Added configuration functionality to sync students information with Synergy.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Multiple instructors may now be added to a session.
                    </ListGroup.Item>
                  </ListGroup>

                </Tab.Pane>

                <Tab.Pane eventKey='/home/help#todo'>
                  <ListGroup>
                    <ListGroup.Item>
                      Continue improving non-recurring session functionality.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Allow users to
                      <ul>
                        <li>Handle attendance for multiple instructors, where one or more instructors has a different start and end time from the others. (The Current Priority)</li>
                        <li>Handle attendance details for parents and family.</li>
                        <li>Edit past attendance sheets.</li>
                        <li>Hide inactive sessions. (Sessions cannot be deleted, this year's sessions should go inactive on a set date).</li>
                        <li>Sync synergy student information at the coordinator/administrator level. (For one's own organization only.)</li>
                      </ul>
                    </ListGroup.Item>
                  </ListGroup>

                </Tab.Pane>

              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </PageContainer >
  )
}