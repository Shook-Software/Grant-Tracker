import { useEffect, useState, useContext } from 'react'
import { Container, Row, Col, Spinner, Button as BButton, Form } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Table, { Column, SortDirection } from 'components/BTable'
import AddInstructorsModal from 'components/Modals/AddInstructorModal'
import Button from 'components/Input/Button'

import { DropdownOption } from 'types/Session'
import { addInstructor, fetchGrantTrackerInstructors } from './api'
import { ApiResult } from 'components/ApiResultAlert'

import InstructorPage from 'components/Displays/Instructor'
import paths from 'utils/routing/paths'
import { OrgYearContext } from '..'


const createColumns = (): Column[] => [
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
        <BButton className='' size='sm'>
          <Link to={value} style={{ color: 'inherit' }}>
            View
          </Link>
        </BButton>
      </div>
    )
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Admin / Staff'
  const { instructorSchoolYearGuid } = useParams()
  const { orgYear } = useContext(OrgYearContext)
  const [state, setState] = useState<any[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const navigate = useNavigate()

  function handleSearchTermChange(term) {
    term = term.toLocaleLowerCase()
    setSearchTerm(term)
  }

  function fetchInstructors (): void {
    setIsLoading(true)

    fetchGrantTrackerInstructors(orgYear?.guid)
      .then(res => setState(res))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  function addInternalInstructor (instructor): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      addInstructor(orgYear.guid, instructor)
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
      addInstructor(orgYear?.guid, instructor)
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
  }, [orgYear])

  let columns: Column[] = createColumns()
  let rowClick = null
  if (instructorSchoolYearGuid) {
    columns = [columns[0], columns[1]]
    rowClick = (event, row) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}/${row.guid}`)
  }

  return (
    <Container>
      <AddInstructorsModal
        show={showModal}
        orgYearGuid={orgYear?.guid}
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
          <h5>Instructors for {orgYear?.organization.name}</h5>
          {isLoading ? (
            <Spinner animation='border' />
          ): !state || state.length === 0 ? (
            <div className='d-flex align-items-center justify-content-center'>
              <p>No instructors found...</p>
            </div>
          ) : (<div className='pt-1'>
          <Row>
            <Col md={!instructorSchoolYearGuid ? 12 : 3}>
              <Row>
                <Col md={!instructorSchoolYearGuid ? 3 : 12} className='p-0'>
                  <Form.Control 
                    type='text' 
                    className='border-bottom-0'
                    placeholder='Filter instructors...'
                    value={searchTerm} 
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                  />
                </Col>
              </Row>
              <Row>
                <Table 
                  columns={columns} 
                  dataset={state.filter(e => (`${e.instructor.firstName} ${e.instructor.lastName}`).toLocaleLowerCase().includes(searchTerm))} 
                  defaultSort={{index: 1, direction: SortDirection.Ascending}}
                  rowProps={{key: 'guid', onClick: rowClick}} 
                />
              </Row>
            </Col>
            <Col md={!instructorSchoolYearGuid ? 0 : 9}>
              {instructorSchoolYearGuid && <InstructorPage instructorSchoolYearGuid={instructorSchoolYearGuid} />}
            </Col>
          </Row>
        </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}