import { PageContainer } from 'styles'

export default ({ }) => {
  document.title = 'GT - Help'

  return (
    <PageContainer className='p-3'>
      <div className="mx-auto px-4 max-w-7xl">
        <h3>FAQ</h3>
        <h6>{'(to be updated frequently)'}</h6>
        <ul className="list-none border border-gray-200 rounded-lg divide-y divide-gray-200">
          <li className="list-none p-4">
            <div className="font-bold">
              How do I make sessions?
            </div>
            <div style={{ marginLeft: '2.5rem' }}>
              Sessions can be added under Admin, on the tab labeled 'Sessions'. Here you can view your site's sessions, filter them, and create new ones.
            </div>
          </li>
          <li className="list-none p-4">
            <div>
              <div className="font-bold">
                I can't find instructors to add to a session, how do I add instructors?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Instructors are added to a site in the Instructors tab of the Admin page. Since instructors need a status for reporting purposes, they
                must be added in this manner before they can be used in a Session. In future versions, instructors may be added from the session creation page.
              </div>
            </div>
          </li>
          <li className="list-none p-4">
            <div>
              <div className="font-bold">
                How do I view a single session's details?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                This can be accessed through Admin, on the tab labeled 'Sessions'. From your site's sessions, hit view
                on the on you would like to view details for. This should redirect you to the information page.
              </div>
            </div>
          </li>
          <li className="list-none p-4">
            <div>
              <div className="font-bold">
                How do I take attendance?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Attendance is handled from a session's information page, on the right-hand side.
              </div>
            </div>
          </li>
          <li className="list-none p-4">
            <div>
              <div className="font-bold">
                How do I add students to a session?
              </div>
              <div style={{ marginLeft: '2.5rem' }}>
                Students may be added from a session's information page, in the 'Students' section. Hit 'Add', then search for students.
                For recurring sessions, the students must have specific weekdays selected at the bottom of the search menu.
              </div>
            </div>
          </li>
        </ul>
        <li className="list-none p-4 border-t border-gray-200">
          <div className="font-bold">
            Help! Something isn't working correctly, what do I do?
          </div>
          <div style={{ marginLeft: '2.5rem' }}>
            Please <a href='https://forms.office.com/r/0Hq5fsxHze'>report</a> your issue, with all relevant details so that the underlying cause of the issue may be ascertained.
          </div>
        </li>
        <li className="list-none p-4 border-t border-gray-200">
          <div className="font-bold">
            I don't see my question listed.
          </div>
          <div style={{ marginLeft: '2.5rem' }}>
            If there is a pressing question, please email Elizabeth.Baldry@tusd1.org.
            Otherwise, please fill out an entry at <a href='https://forms.office.com/r/0Hq5fsxHze'>https://forms.office.com/r/0Hq5fsxHze</a>.
          </div>
        </li>
      </div>




    </PageContainer >
  )
}

/*
  <Container className='my-3'>
        <h3>Changelog</h3>
        <h6>Version 1.1.1 - June 6th, 2022</h6>
        <Tab.Container defaultActiveKey='/home/help#fixes'>
          <div className="grid grid-cols-12">
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
          </div>
        </Tab.Container>
      </Container>
      */