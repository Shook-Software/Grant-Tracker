import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col, Modal, Form, Button as BButton, Spinner, Accordion, Toast, ToastContainer } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'
import Button from 'components/Input/Button'

import api from 'utils/api'
import { Quarter, YearView } from 'Models/OrganizationYear'

import Years from './Years'

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
          the organization year <span className='text-danger'>{orgYear.organization.name}, {orgYear.year.schoolYear} - {Quarter[orgYear.year.quarter]}</span> including all student, instructor, and attendance information
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

const createOrgColumns = (deleteOrg, orgYearColumns): Column[] => [
  {
    label: "Organization",
    attributeKey: 'name',
    sortable: true
  },
  {
    label: "",
    attributeKey: "organizationYears",
    cellProps: {
      className: 'p-0'
    },
    transform: (orgYears) => {
      return (
        <Accordion>
        <Accordion.Item className='border-0' eventKey="0">
          <Accordion.Header>Years</Accordion.Header>
          <Accordion.Body className='p-0'> 
          <Table dataset={orgYears} columns={orgYearColumns} className='m-0' rowProps={{key: 'guid'}} />
          </Accordion.Body>
        </Accordion.Item>
        </Accordion>

      )
    },
    sortable: false
  },
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
]

export default (): JSX.Element => {

  const [organizations, setOrganizations] = useState([])
  const [organizationsAreLoading, setOrgsLoading] = useState<boolean>(false)
  const [orgFetchError, setOrgFetchError] = useState<string>()

  const [showOrgToast, setShowOrgToast] = useState<boolean>(false)
  const [deletedOrg, setDeletedOrg] = useState(null)
  const [orgDeleteError, setOrgDeleteError] = useState<boolean>()

  const [showOrgYearToast, setShowOrgYearToast] = useState<boolean>(false)
  const [deletedOrgYear, setDeletedOrgYear] = useState(null)
  const [orgYearDeleteError, setOrgYearDeleteError] = useState<boolean>()

  async function fetchOrganizationsAsync (): Promise<void> {
    setOrgsLoading(true)

    api
      .get('organization')
      .then(res => {
        setOrganizations(res.data)
        setOrgFetchError(undefined)
      })
      .catch(err => setOrgFetchError('An error has occured while fetching organizations.'))
      .finally(() => setOrgsLoading(false))
  }

  const deleteOrganization = (organizationGuid): Promise<void> => (
	  api
		  .delete(`organization/${organizationGuid}`)
		  .then(() => {
      })
		  .catch((err) => {
        setOrgDeleteError(true)
        setShowOrgToast(true)
		  })
      .finally(() => {
        let deletedOrg = organizations.find(x => x.guid == organizationGuid)
        setDeletedOrg(deletedOrg)
        setShowOrgToast(true)
        fetchOrganizationsAsync()
      })
  )
  
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
        fetchOrganizationsAsync()
      })
  )

  useEffect(() => {
    fetchOrganizationsAsync()
  }, [])

  const orgYearColumns: Column[] = createOrgYearColumns(deleteOrganizationYear)
  const orgColumns: Column[] = createOrgColumns(deleteOrganization, orgYearColumns)

  return (
    <Tab.Container defaultActiveKey='year'>

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

      <Row className='p-3'>
        <Col lg={3}>
          <Nav variant='pills' className='flex-column'>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='year'>
                School Years
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='org'>
                Organizations
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col lg={9}>
          <Tab.Content>
            <Tab.Pane eventKey='year'>
				<Years />
            </Tab.Pane>
            
            <Tab.Pane eventKey='org'>

              {
                organizationsAreLoading ? <Spinner animation='border' role='status' />
                : orgFetchError ? <div className='text-danger'>{orgFetchError}</div>
                : <>
                  <Row>
                    <Button className='' onClick={() => null}>
                      Add Organization (Synergy)
                    </Button>
                  </Row>

                  <Row className='my-3'>
                    <Table dataset={organizations} columns={orgColumns} rowProps={{key: 'guid'}} />
                  </Row>
                </>
              }

            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>

    </Tab.Container>
  )
}

//create modal

//School years
//display existing years, maybe some statistics if I feel fancy and am ahead of time
//main focus: Be able to create new years


const ConfirmDeletionModal = ({showModal, handleClose, confirmationPhrase, deletionCallback}): JSX.Element => {
	const [show, setShow] = useState<boolean>(showModal)

	const executeDeletion = () => {
		deletionCallback()
		handleClose()
	}

	console.log(confirmationPhrase)

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