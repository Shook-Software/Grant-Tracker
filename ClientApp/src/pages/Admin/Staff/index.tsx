import { useEffect, useState } from 'react'
import { Modal, Alert, Container, Row, Col, Spinner, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Table, { Column } from 'components/BTable'
import SearchInstructorsModal from './SearchInstructorsModal'
import Button from 'components/Input/Button'

import { useAdminPage, Context } from '../index'
import { DropdownOption } from 'types/Session'
import { StaffDto } from 'types/Dto'
import api from 'utils/api'


const columns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'instructor.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'instructor.lastName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'instructor.badgeNumber',
    sortable: true
  },
  {
    label: 'Status',
    attributeKey: 'status',
    sortable: true,
    transform: (value: DropdownOption): string => value.label
  },
  {
    label: '',
    attributeKey: 'guid',
    sortable: false,
    transform: (value: string) => (
      <div className='d-flex justify-content-center'>
        <Button size='sm'>
          <Link to={value} style={{ color: 'inherit' }}>
            View
          </Link>
        </Button>
      </div>
    )
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Admin / Staff'
  const { user }: Context = useAdminPage()
  const [state, setState] = useState<any[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function fetchInstructors (name: string = ''): void {
    setIsLoading(true)

    api
      .get('instructor', { 
          params: {
          name: '',
          organizationGuid: user.organization.guid,
          yearGuid: user.year.guid
        }
      })
      .then(res => setState(res.data))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => {
    fetchInstructors()
    setShowModal(false)
  }

  useEffect(() => {
    fetchInstructors()
  }, [user])

  return (
    <Container>
      <InstructorsModal show={showModal} handleClose={handleCloseModal} />
      <Row>
        <Col>
          <Button
            className='d-flex align-items-center mt-3'
            onClick={handleOpenModal}
          >
            Add New Instructor
          </Button>
        </Col>
      </Row>
      <Row className='my-3'>
        <Col>
          <h5>Instructors for {user.organizationName}</h5>
          {isLoading ? (
            <Spinner animation='border' />
          ): !state || state.length === 0 ? (
            <div className='d-flex align-items-center justify-content-center'>
              <p>No instructors found...</p>
            </div>
          ) : (
            <Table columns={columns} dataset={state} rowProps={{key: 'guid'}} />
          )}
        </Col>
      </Row>
    </Container>
  )
}

interface ApiResult {
  instructorName: string
  success: boolean
  reason?: string
}

const ResultAlert = ({
  apiResult
}: {
  apiResult: ApiResult | undefined
}): JSX.Element => {
  const [show, setShow] = useState<boolean>(true)

  if (!apiResult || !show) return <></>

  const variant: string = apiResult.success ? 'success' : 'danger'
  const result: string = `${apiResult.instructorName} ${
    apiResult.success ? ' was added!' : 'could not be added.'
  }`

  return (
    <Alert variant={variant} onClose={() => setShow(false)} dismissible>
      <Alert.Heading>{result}</Alert.Heading>
      <p>{apiResult.reason}</p>
    </Alert>
  )
}

const InstructorsModal = ({ show, handleClose }): JSX.Element => {
  const [apiResult, setApiResult] = useState<ApiResult>()

  function addInstructor (instructor: StaffDto): void {
    const fullName: string = `${instructor.firstName} ${instructor.lastName}`
    api
      .post('staff/add', instructor)
      .then(res => {
        setApiResult({
          instructorName: fullName,
          success: true
        })
      })
      .catch(err => {
        setApiResult({
          instructorName: fullName,
          success: false
        })
      })
  }

  return (
    <Modal show={show} onHide={handleClose} centered size='xl' scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          Adding New Instructor(s)...
          <ResultAlert apiResult={apiResult} />
        </Modal.Title>
      </Modal.Header>
      <SearchInstructorsModal
        addInstructor={addInstructor}
        handleClose={handleClose}
      />
    </Modal>
  )
}
