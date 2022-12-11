import { useEffect, useState } from 'react'
import { Container, Row, Col, Spinner, Button as BButton } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import Table, { Column, SortDirection } from 'components/BTable'
import AddInstructorsModal from 'components/Modals/AddInstructorModal'
import Button from 'components/Input/Button'

import { useAdminPage, Context } from '../index'
import { DropdownOption } from 'types/Session'
import { addInstructor, fetchGrantTrackerInstructors } from './api'
import { ApiResult } from 'components/ApiResultAlert'


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
        <BButton className='p-0' size='sm'>
          <Link className='p-3' to={value} style={{ color: 'inherit' }}>
            View
          </Link>
        </BButton>
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

  function fetchInstructors (): void {
    setIsLoading(true)

    fetchGrantTrackerInstructors()
      .then(res => setState(res))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  function addInternalInstructor (instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      addInstructor(instructor)
        .then(res => {
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: true
          })
        })
        .catch(err => {
          resolve({
            label: `${instructor.firstName} ${instructor.lastName}`,
            success: false
          })
        })
    })
  }

  function addExternalInstructor (instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      addInstructor(instructor)
      .then(res => {
        resolve({
          label: `${instructor.firstName} ${instructor.lastName}`,
          success: true
        })
      })
      .catch(err => {
        resolve({
          label: `${instructor.firstName} ${instructor.lastName}`,
          success: false
        })
      })
    })
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
      <AddInstructorsModal
        show={showModal}
        handleClose={handleCloseModal}
        onInternalChange={addInternalInstructor}
        onExternalChange={addExternalInstructor}
      />
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
            <Table 
              columns={columns} 
              dataset={state} 
              defaultSort={{index: 1, direction: SortDirection.Ascending}}
              rowProps={{key: 'guid'}} 
            />
          )}
        </Col>
      </Row>
    </Container>
  )
}