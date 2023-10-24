import { Col, Nav, Row, Tab } from 'react-bootstrap'
import { BlackoutDateConfig } from './BlackoutDates'
import { PageContainer } from 'styles'

export default (): JSX.Element => {
	return (
		<PageContainer>
			<Tab.Container defaultActiveKey='blackout'>
				<Row>
					<Col md={2} className='p-0 mt-3' >
						<Row style={{border: '1px solid black', borderRadius: '0.3rem', height: 'fit-content', width: 'fit-content'}}>
							<Nav variant='pills' className='flex-column p-0'>
								<Nav.Item>
									<Nav.Link eventKey='blackout'>
										Blackout Dates
									</Nav.Link>
								</Nav.Item>
							</Nav>
						</Row>
					</Col>

					<Col md={10}>
						<Tab.Content>
							<Tab.Pane eventKey='blackout'>
								<BlackoutDateConfig />
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</PageContainer>
	)
}