import { useEffect, useState } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import Dropdown from 'components/Input/Dropdown'
import Table, { Column } from 'components/BTable'
import { Row, Col, Modal, Button as BButton, Toast, ToastContainer, Spinner, Accordion } from 'react-bootstrap'
import { Quarter } from 'Models/OrganizationYear'
import Button from 'components/Input/Button'
import api from 'utils/api'

export default ({}): JSX.Element => {

	const [secondColumnTransform, setSecondColumnTransform] = useState<string>('orgYears')
	const [showOrgToast, setShowOrgToast] = useState<boolean>(false)
	const [deletedOrg, setDeletedOrg] = useState(null)
	const [orgDeleteError, setOrgDeleteError] = useState<boolean>()

	const [showOrgYearToast, setShowOrgYearToast] = useState<boolean>(false)
	const [deletedOrgYear, setDeletedOrgYear] = useState(null)
	const [orgYearDeleteError, setOrgYearDeleteError] = useState<boolean>()

	const { isPending: organizationsAreLoading, data: organizations, error: orgFetchError, refetch: refetchOrganizations, } = useQuery({
		queryKey: ['organizations'],
		queryFn: () => api.get('organization').then(res => res.data)
	  }, new QueryClient())
  
	const deleteOrganizationYear = (organizationGuid, organizationYearGuid): Promise<void> => (
		api
			.delete(`organizationYear/${organizationYearGuid}`)
			.then(() => {})
			.catch((err) => {
				setOrgYearDeleteError(true)
			})
			.finally(() => {
				let orgYear = organizations.find(x => x.guid == organizationGuid).organizationYears.find(x => x.guid == organizationYearGuid)
				setDeletedOrgYear(orgYear)
				setShowOrgYearToast(true)
				refetchOrganizations()
			})
	)

	const deleteOrganization = (organizationGuid): Promise<void> => (
		api
			.delete(`organization/${organizationGuid}`)
			.then(() => {})
			.catch((err) => {
				setOrgDeleteError(true)
				setShowOrgToast(true)
			})
			.finally(() => {
				let deletedOrg = organizations.find(x => x.guid == organizationGuid)
				setDeletedOrg(deletedOrg)
				setShowOrgToast(true)
				refetchOrganizations()
			})
	)

	if (organizationsAreLoading)
		return <Spinner animation='border' role='status' />
	else if (orgFetchError)
		<div className='text-danger'>{orgFetchError}</div>

	const orgYearColumns: Column[] = createOrgYearColumns(deleteOrganizationYear)
	const orgColumns: Column[] = createOrgColumns(deleteOrganization, secondColumnTransform, setSecondColumnTransform, orgYearColumns)

	return (
		<>
			<Row className='d-flex justify-content-center'>
				<ToastContainer className='position-static'>
					<Toast show={showOrgToast} onClose={() => setShowOrgToast(false)} bg={orgDeleteError ? 'danger' : ''} className='my-3'>
						<Toast.Header>
							{orgDeleteError ? 'Error' : 'Successful Deletion'}
						</Toast.Header>
						<Toast.Body>
							{orgDeleteError ?  'An error occured while trying to delete the organization.' : `${deletedOrg?.name} was deleted.`}
						</Toast.Body>
					</Toast>
				</ToastContainer>
			</Row>
	
			<Row className='d-flex justify-content-center'>
				<ToastContainer className='position-static'>
					<Toast show={showOrgYearToast} onClose={() => setShowOrgYearToast(false)} bg={orgYearDeleteError ? 'danger' : ''} className='my-3'>
						<Toast.Header>
							{orgYearDeleteError ? 'Error' : 'Successful Deletion'}
						</Toast.Header>
						<Toast.Body>
							{orgYearDeleteError ?  'An error occured while trying to delete the organization.' : `${deletedOrgYear?.organization.name}, ${deletedOrgYear?.year.schoolYear} - ${Quarter[deletedOrgYear?.year.quarter]} was deleted.`}
						</Toast.Body>
					</Toast>
				</ToastContainer>
			</Row>
			<Row>
				<Button className='' onClick={() => null}>
					Add Organization (Synergy)
				</Button>
			</Row>

			<Row className='my-3'>
				<Table dataset={organizations} columns={orgColumns} rowProps={{key: 'guid'}} />
			</Row>
		</>
	)
}

const createOrgYearColumns = (deleteOrgYear): Column[] => [
	{
	  label: 'Year',
	  attributeKey: 'year.schoolYear',
	  sortable: true
	}, 
	{
	  label: 'Quarter',
	  attributeKey: 'year.quarter',
	  transform: (quarter) => Quarter[quarter],
	  sortable: true
	},
	{
	  label: "",
	  attributeKey: '',
		cellProps: { className: 'p-0' },
	  transform: (orgYear) => {
		const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)
  
		const deletionConfirmationPhrase: JSX.Element = (
		  <span>
			the organization year <span className='text-danger'>{orgYear.orgName}, {orgYear.year.schoolYear} - {Quarter[orgYear.year.quarter]}</span> including all student, instructor, and attendance information
		  </span>
		)
  
		return (
		  <div className='d-flex justify-content-center align-items-center my-1'>
			<BButton variant="danger" onClick={() => setShowDeletionModal(true)}>
			  Delete
			</BButton>  
  
			{showDeletionModal ?
			  <ConfirmDeletionModal 
				showModal={showDeletionModal}
				handleClose={() => setShowDeletionModal(false)} 
				confirmationPhrase={deletionConfirmationPhrase}
				deletionCallback={() => deleteOrgYear(orgYear.organization.guid, orgYear.guid)} 
			  />
			  : null
			}
			
		  </div>
		)
	  },
	  sortable: false
	}
]

const orgYearColumnTransform: (organization, orgYearColumns) => JSX.Element = (organization, orgYearColumns) => {
	if (!organization)
		return <></>

	return (
		<Accordion>
		  <Accordion.Item className='border-0' eventKey="0">
			  <Accordion.Header>Years</Accordion.Header>
			  <Accordion.Body className='p-0'> 
				  <Table dataset={organization.organizationYears.map(oy => ({...oy, orgName: organization.name, orgGuid: organization.guid}))} 
					  columns={orgYearColumns} 
					  className='m-0' 
					  rowProps={{key: 'guid'}} />
			  </Accordion.Body>
		  </Accordion.Item>
		</Accordion>
	)
}

const NewAttendanceGoalFormRow = ({onSubmit}): JSX.Element => {
	const [goal, setGoal] = useState({
		startDate: (new Date()).toISOString().slice(0, 10),
		endDate: (new Date()).toISOString().slice(0, 10),
		regularAttendees: 0
	})

	function handleSubmit() {
		onSubmit(goal)
			.then(res => {
				setGoal({
					startDate: (new Date()).toISOString().slice(0, 10),
					endDate: (new Date()).toISOString().slice(0, 10),
					regularAttendees: 0
				})
			})
	}

  return (
	<div className='row'>
		<div className='col-4 pe-0'>
			<input className='form-control form-control-sm' type='date' value={goal.startDate} onChange={(e) => {
					goal.startDate = e.target.value
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='col-4 px-0'>
			<input className='form-control form-control-sm' type='date' value={goal.endDate} onChange={(e) => {
					goal.endDate = e.target.value
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='col-2 px-0'>
			<input className='form-control form-control-sm' type='number' value={goal.regularAttendees} onChange={(e) => {
					goal.regularAttendees = Number(e.target.value)
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='col-2'>
			<button className='btn btn-sm btn-primary' type='button' onClick={handleSubmit}>Add</button>
		</div>
	</div>
  )
}

//this is all very silly
const AttendanceGoalsColumnTransform: (organization) => JSX.Element = ({organization}) => {
	const [attendanceGoals, setAttendanceGoals] = useState<any[]>(organization.attendanceGoals.map(ag => ({
		...ag, 
		startDate: `${ag.startDate.year}-${ag.startDate.month.toString().padStart(2, '0')}-${ag.startDate.day.toString().padStart(2, '0')}`,
		endDate: `${ag.endDate.year}-${ag.endDate.month.toString().padStart(2, '0')}-${ag.endDate.day.toString().padStart(2, '0')}`
	})) || [])
	const [apiResult, setApiResult] = useState({ error: '', postSuccess: false, patchSuccess: false, deleteSuccess: false })

	function updateGoal(value) {
		const goal = attendanceGoals.find(x => x.guid == value.guid)
		goal.startDate = value.startDate
		goal.endDate = value.endDate
		goal.regularAttendees = value.regularAttendees

		setAttendanceGoals([...attendanceGoals])
	}

	async function postGoal(goal): Promise<any> {
		try {
			const result = await api.post(`organization/${organization.guid}/attendanceGoal`, goal)
			setApiResult({error: '', postSuccess: true, patchSuccess: false, deleteSuccess: false})
			
			goal.guid = result.data
			setAttendanceGoals([...attendanceGoals, goal])
		} 
		catch { 
			setApiResult({error: 'Failed to add new attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	async function patchGoal(goal) {
		try {
			await api.patch(`organization/${organization.guid}/attendanceGoal/${goal.guid}`, goal)
			setApiResult({error: '', postSuccess: false, patchSuccess: true, deleteSuccess: false})
		} 
		catch { 
			setApiResult({error: 'Failed to update attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	async function deleteGoal(goal) {
		try {
			await api.delete(`organization/${organization.guid}/attendanceGoal/${goal.guid}`)
			setApiResult({error: '', postSuccess: false, patchSuccess: false, deleteSuccess: true})
			setAttendanceGoals(attendanceGoals.filter(ag => ag.guid != goal.guid))
		} 
		catch { 
			setApiResult({error: 'Failed to delete attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	const attendanceGoalRow: (goal) => JSX.Element = (goal) => {

		return (
			<div key={goal.guid} className='row'>
				<div className='col-4 pe-0'>
					<input className='form-control form-control-sm' type='date' value={goal.startDate} onChange={(e) => {
							goal.startDate = e.target.value
							updateGoal(goal)
						}} 
					/>
				</div>

				<div className='col-4 px-0'>
					<input className='form-control form-control-sm' type='date' value={goal.endDate} onChange={(e) => {
							goal.endDate = e.target.value
							updateGoal(goal)
						}} 
					/>
				</div>

				<div className='col-2 px-0'>
					<input className='form-control form-control-sm' type='number' value={goal.regularAttendees} onChange={(e) => {
							goal.regularAttendees = Number(e.target.value)
							updateGoal({...goal})
						}} 
					/>
				</div>

				<div className='col-2'>
					<div className="dropdown dropstart">
						<button className='btn btn-sm btn-secondary dropdown-toggle' data-bs-toggle='dropdown'>Actions</button>

						<ul className='dropdown-menu p-0'>
							<li><button className='btn btn-sm btn-primary w-100' type='button' style={{borderRadius: '0'}} onClick={() => patchGoal(goal)}>Update</button></li>
							<li><hr className='my-1' /></li>
							<li><button className='btn btn-sm btn-danger w-100' type='button' style={{borderRadius: '0'}} onClick={() => deleteGoal(goal)}>Delete</button></li>
						</ul>
					</div>
				</div>
			</div>
		)
	}

	const notification: () => JSX.Element = () => {
		if (apiResult.error.length > 0)
			return <div className='row px-3 text-danger'>{apiResult.error}</div>
		else if (apiResult.patchSuccess)
			return <div className='row px-3 text-success'>Attendance Goal has been updated!</div>
		else if (apiResult.postSuccess)
			return <div className='row px-3 text-success'>Attendance Goal has been created!</div>
		else if (apiResult.deleteSuccess)
			return <div className='row px-3 text-success'>Attendance Goal has been deleted!</div>
		else
			return <></>
	}

	return ( 
		<div className='container h-100 d-flex flex-column justify-content-center py-3'>
			{notification()}
			{attendanceGoals.map(goal => attendanceGoalRow(goal))}
			<NewAttendanceGoalFormRow onSubmit={postGoal} />
		</div>
	)
}

const secondColumnOptions = [
	{ guid: 'orgYears', label: 'Organization Years'},
	{ guid: 'attendGoals', label: 'Attendance Goals'}
]

const createOrgColumns = (deleteOrg, secondColumnTransform, setSecondColumnTransform, additionalColumns): Column[] => [
	{
	  label: "Organization",
	  attributeKey: 'name',
	  sortable: true
	},
	{
	  label: "",
	  attributeKey: "",
	  cellProps: {
		className: 'p-0'
	  },
	  headerTransform: () => {
		return (
			<div className='container'>
				<Dropdown
					value={secondColumnTransform}
					options={secondColumnOptions}
					onChange={(value: string) => {
						setSecondColumnTransform(value)
					}}
				/>
				{
					secondColumnTransform != 'orgYears'
						? <div className='row align-items-end'>
							<small className='col-4 pe-0'>Start Date</small>
							<small className='col-4 px-0'>End Date</small>
							<small className='col-2 px-0'># Regular Attendees</small>
							<small className='col-2'>Actions</small>
						</div>
						: <></>
				}
			</div>
		)
	  },
	  transform: (organization) => { 
		return secondColumnTransform == 'orgYears'
			? orgYearColumnTransform(organization, additionalColumns)
			: <AttendanceGoalsColumnTransform organization={organization} />
	} ,
	  sortable: false
	}
  ]

  /*
,
	{
	  label: "",
	  attributeKey: '',
	  transform: (organization) => {
		const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)
		const deletionConfirmationPhrase: JSX.Element = (
		  <span>
			the organization <span className='text-danger'>{organization.name}</span> including all years with their student, instructor, and attendance information
		  </span>
		)
  
		return (
		  <div className='d-flex justify-content-center'>
			<BButton variant="danger" onClick={() => setShowDeletionModal(true)}>
			  Delete
			</BButton>  
			{showDeletionModal ?
			  <ConfirmDeletionModal 
				showModal={showDeletionModal} 
				handleClose={() => setShowDeletionModal(false)} 
				confirmationPhrase={deletionConfirmationPhrase}
				deletionCallback={() => deleteOrg(organization.guid)} 
			  />
			  : null
			}
		  </div>
		)
	  },
	  sortable: false
	}
  */

  const ConfirmDeletionModal = ({showModal, handleClose, confirmationPhrase, deletionCallback}): JSX.Element => {
	  const [show, setShow] = useState<boolean>(showModal)
  
	  const executeDeletion = () => {
		  deletionCallback()
		  handleClose()
	  }
  
	  return (
		  <Modal
			  show={show}
			  onHide={() => setShow(false)}
		size='lg'
		  >
			<Modal.Header closeButton>
				<Modal.Title>Confirm Deletion</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Are you certain that you want to delete {confirmationPhrase}?
			</Modal.Body>
			<Modal.Footer>
				<BButton variant='secondary' onClick={() => handleClose()}>No, Close</BButton>
				<BButton variant='danger' onClick={() => executeDeletion()}>Yes, Delete</BButton>
			</Modal.Footer>
		  </Modal>
	  )
  }