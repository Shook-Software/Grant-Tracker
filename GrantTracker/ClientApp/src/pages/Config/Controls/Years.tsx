import { useState, useEffect } from 'react'
import { LocalDate, Year } from '@js-joda/core'
import { Row, Col, Modal, Form, Button, Spinner } from 'react-bootstrap'
import { DateOnly } from "Models/DateOnly"
import { Quarter, YearView } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'
import PlusButton from 'components/Input/Button'
import Table, { Column } from "components/BTable"
import { User } from 'utils/authentication'
import api from 'utils/api'
import Dropdown from 'components/Input/Dropdown'


const columns: Column[] = [
	{
	  label: 'Year',
	  attributeKey: 'schoolYear',
	  sortable: true
	}, 
	{
	  label: 'Quarter',
	  attributeKey: 'quarter',
	  transform: (quarter) => Quarter[quarter],
	  sortable: true
	},
	{
	  label: 'Start Date',
	  attributeKey: 'startDate',
	  transform: (value) => `${value.month}/${value.day}/${value.year}`,
	  sortable: true
	},
	{
	  label: 'End Date',
	  attributeKey: 'endDate',
	  transform: (value) => `${value.month}/${value.day}/${value.year}`,
	  sortable: true
	},
	{
	  label: 'Is Active',
	  attributeKey: 'isCurrentSchoolYear',
	  transform: (isCurrent: boolean) => isCurrent ? 'Yes' : 'No',
	  sortable: true
	},
	{
	  label: 'Set Active',
	  attributeKey: '',
	  transform: (year) => {
		if (year.isCurrentSchoolYear)
		  return <></>
	  
		return (
		  <Button onClick={() => {
			year.isCurrentSchoolYear = true
			year.startDate = DateOnly.toLocalDate(year.startDate)
			year.endDate = DateOnly.toLocalDate(year.endDate)
			api
			  .patch('developer/year', year)
			  .then(res => console.log(res))
		  }}>
			Set Active Year
		  </Button>
		)
	  },
	  sortable: false
	},
	{
		label: '',
		attributeKey: 'yearGuid',
		transform: (yearGuid) => {
			const [numRecordsUpdated, setNumRecordsUpdated] = useState<number | undefined>()
			const [loading, setLoading] = useState<boolean>(false)

			return (
				<div>
					<Button onClick={() => {
						setLoading(true)
						api
							.patch(`developer/year/${yearGuid}/grades/sync`)
							.then(res => {
								setNumRecordsUpdated(res.data)
							})
							.catch(err => {
								setNumRecordsUpdated(-1)
							})
							.finally(() => {
								setLoading(false)
							})
						}}
						disabled={loading}
					>
						{loading ? <Spinner animation="border" role="status" /> : 'Synchronize Synergy'}
					</Button>
					{
						numRecordsUpdated == -1 ? <div className='text-danger'>Failed to sync</div> : null
					}
				</div>
			)
		},
		sortable: false
	}
	//extra statistics
  ]



export default (): JSX.Element => {
	const [schoolYears, setSchoolYears] = useState([])
	const [yearsAreLoading, setYearsLoading] = useState<boolean>(false)
	const [yearsFetchError, setYearsFetchError] = useState<string>()
	const [show, setShow] = useState<boolean>(false) 
	
	
	async function fetchYearsAsync (): Promise<void> {
		setYearsLoading(true)

		api
		  .get('developer/year')
		  .then(res => {setSchoolYears(res.data)})
		  .catch(err => setYearsFetchError('An error has occured while fetching organizations.'))
		  .finally(() => setYearsLoading(false))
	  } 

	  async function createNewYearAsync (year: YearView, userList: User[]): Promise<void> {
		const users = userList.map(user => ({
		  userGuid: user.userGuid,
		  organizationGuid: user.organization.guid,
		  claim: user.claim
		}))
	
		api
		  .post('developer/year', {yearModel: year, users})
		  .then(res => fetchYearsAsync())
	  }

	  useEffect(() => {
		fetchYearsAsync()
	  }, [])

	return (
		<>
			<Row>
				<PlusButton className='' onClick={() => setShow(true)}>
					New School Year
				</PlusButton>
			</Row>
			
			{
                yearsAreLoading ? <Spinner className='mt-3' animation='border' role='status' />
                : yearsFetchError ? <div className='text-danger'>{yearsFetchError}</div>
                : <>
					<Row className='my-3'>
						<Table dataset={schoolYears} columns={columns} rowProps={{key: 'yearGuid'}} />
					</Row>
				</>
			}

			<YearModal show={show} handleClose={() => setShow(false)} handleSubmit={(year: YearView, userList: string[]) => createNewYearAsync(year, userList)} />
		</>
	)
}



const createModalColumns = (onChange): Column[] => ([
	{
	  label: 'Keep User',
	  attributeKey: '',
	  sortable: false,
	  transform: (user: User) => (
	  <Form.Check 
		type='checkbox' 
		checked={user.keepUser}
		onChange={(e) => onChange(user.userOrganizationYearGuid, e.target.checked)}
	  />
	  )
	},
	{
	  label: 'Name',
	  attributeKey: '',
	  key: 'userOrganizationYearGuid',
	  sortable: true,
	  transform: (user: User) => `${user.firstName} ${user.lastName}`
	},
	{
	  label: 'Organization',
	  attributeKey: 'organization.name',
	  sortable: true
	},
	{
	  label: 'Badge Number',
	  attributeKey: 'badgeNumber',
	  sortable: false
	}
  ])

const YearModal = ({show, handleClose, handleSubmit}): JSX.Element => {
	document.title = 'GT - Config / Controls'
	const [currentUsers, setCurrentUsers] = useState<(User & {keepUser: boolean})[]>([])
	const [year, setYear] = useState<YearView>({
	  guid: '',
	  schoolYear: Year.now().toString(),
	  startDate: LocalDate.now(), 
	  endDate: LocalDate.now(),
	  quarter: Quarter['Summer']
	})
  
	const quarters: DropdownOption[] = [
	  {
		guid: Quarter['Summer'].toString(),
		label: 'Summer'
	  },
	  {
		guid: Quarter['Academic Year'].toString(),
		label: 'Academic Year'
	  }
	]
  
	function handleUserChange (userGuid: string, keepUser: boolean): void {
	  const users = currentUsers.map(user => {
		if (user.userOrganizationYearGuid === userGuid) {
		  user.keepUser = keepUser
		}
		return user
	  })
	  setCurrentUsers(users)
	}
  
	useEffect(() => {
	  api
		.get('developer/authentication')
		.then(res => {
		  const users = res.data.map(user => ({...user, keepUser: true}))
		  setCurrentUsers(users)
		})
	}, [])
  
	return (
	  <Modal
		show={show}
		onHide={handleClose}
		centered
		size='xl'
		scrollable
	  >
		<Modal.Header closeButton>
		  <Modal.Title>Creating New Year</Modal.Title>
		</Modal.Header>
  
		<Modal.Body>
		  <Row style={{marginBottom: '2rem'}}>
			<h3><u>Specify Year</u></h3>
			<Form.Group className='w-25'>
			  <Form.Label>Year:</Form.Label>
			  <Form.Control 
				type='number'
				value={year.schoolYear}
				onChange={(e) => {setYear({...year, schoolYear: e.target.value})}}
			  />
			</Form.Group>
  
			<Form.Group className='w-25'>
			  <Form.Label>Start Date:</Form.Label>
			  <Form.Control 
				type='date'
				value={year.startDate!.toString()}
				onChange={(e) => {
				  const date: number[] = e.target.value.split('-').map(i => Number(i))
				  setYear({...year, startDate: LocalDate.of(date[0], date[1], date[2])})
				}}
			  />
			</Form.Group>
  
			<Form.Group className='w-25'>
			  <Form.Label>End Date:</Form.Label>
			  <Form.Control 
				type='date'
				value={year.endDate!.toString()}
				onChange={(e) => {
				  const date: number[] = e.target.value.split('-').map(i => Number(i))
				  setYear({...year, endDate: LocalDate.of(date[0], date[1], date[2])})
				}}
			  />
			</Form.Group>
			
			<Form.Group className='w-25'>
			  <Form.Label>Quarter:</Form.Label>
			  <Dropdown 
				options={quarters}
				value={year.quarter.toString()}
				onChange={(quarter: string) => setYear({...year, quarter: Number(quarter)})}
				disableOverlay
			  />
			</Form.Group>
		  </Row>
  
		  <Row>
			<h3><u>Carry Over Users</u></h3>
			<Table 
			  dataset={currentUsers} 
			  columns={createModalColumns(handleUserChange)} 
			  rowProps={{key: 'userOrganizationYearGuid'}}
			/>
		  </Row>
		</Modal.Body>
  
		<Modal.Footer>
		  <Button 
			variant='primary' 
			onClick={async () => {
			  await handleSubmit(year, currentUsers)
			  handleClose()
			}}
		  >
			Submit New Year
		  </Button>
		</Modal.Footer>
	  </Modal>
	)
  }