import { useState, useEffect, forwardRef, useRef } from 'react'
import { Container, Modal, Button, Form, Popover, OverlayTrigger, Tab, Alert, Nav, Row, Col } from 'react-bootstrap'
import { Formik } from 'formik'
import * as yup from 'yup'

import Table, { Column } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'
import Search from './Search'
import ApiResultAlert, { ApiResult } from 'components/ApiResultAlert'

import { StaffDto } from 'types/Dto'
import { DropdownOption } from 'types/Session'
import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'


import { fetchStatusDropdownOptions, fetchSynergyInstructors, fetchGrantTrackerInstructors } from './api'
//An easy way to add an instructor from Synergy to the GrantTracker.
//Pop up over the table, set the instructor status, then submit.
//@ts-ignore
const InstructorPopover = forwardRef(({ values, dropdownOptions, handleAddInstructor, ...props }, ref): JSX.Element => {
  const [status, setStatus] = useState<string>('')

  const fullName: string = `${values.firstName} ${values.lastName}`
  const labelFor: string = `${fullName}-status`

  return (
    <Popover
      key={values.badgeNumber}
      {...props}
      //@ts-ignore
      ref={ref}
    >
      <Popover.Header>{fullName}</Popover.Header>
      <Popover.Body>
        <Form onSubmit={(event) => {
          event.preventDefault()
          const newInstructor: StaffDto = {
            firstName: values.firstName,
            lastName: values.lastName,
            badgeNumber: values.badgeNumber,
            statusGuid: status
          }
          handleAddInstructor(newInstructor)
        }}>
          <Form.Group>
            <Form.Label htmlFor={labelFor}>Instructor Status:</Form.Label>
            <Dropdown
              id={labelFor}
              options={dropdownOptions}
              value={status}
              onChange={(guid: string) => setStatus(guid)}
            />
          </Form.Group>
          <Button
            disabled={status === ''}
            className='my-2'
            type='submit'
          >
            Add Instructor
          </Button>
        </Form>
      </Popover.Body>
    </Popover>
  )
})

const columnsBuilder = (handleAddInstructor, dropdownOptions): Column[] => ([
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'Organization',
    attributeKey: 'organizationName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'badgeNumber',
    sortable: true
  },
  {
    key: 'addInstructor',
    label: 'Add',
    attributeKey: '',
    sortable: false,
    transform: (value: any) => {
      return (
        <div className='position-relative'>
          <OverlayTrigger
            trigger='click'
            placement='left'
            overlay={(<InstructorPopover values={value} dropdownOptions={dropdownOptions} handleAddInstructor={handleAddInstructor} />)}
            rootClose
          >
            <Button>+</Button>
          </OverlayTrigger>
        </div>
      )
    }
  }
])

const columnsBuilder2 = (handleAddInstructor): Column[] => ([
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
    attributeKey: '',
    sortable: false,
    transform: (value: InstructorSchoolYearView) => (
      <div className='d-flex justify-content-center'>
        <Button onClick={() => handleAddInstructor({...value.instructor, statusGuid: value.status.guid}, value.guid)}>
          +
        </Button>
      </div>
    )
  }
])

const ExistingEmployeeTab = ({orgYearGuid, onChange, headerRef}): JSX.Element => {
  const [instructors, setInstructors] = useState<any[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()

  function handleInstructorAddition (instructor, instructorSchoolYearGuid) {
    onChange(instructor, instructorSchoolYearGuid)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  const columns = columnsBuilder2(handleInstructorAddition)

  useEffect(() => {
    fetchGrantTrackerInstructors(orgYearGuid)
      .then(res => setInstructors(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <>
      <ApiResultAlert apiResult={apiResult} scroll={true} />
      <Table columns={columns} dataset={instructors} />
    </>
  )
}

const schema = yup.object().shape({
  firstName: yup.string().required('First Name is required.'),
  lastName: yup.string().required('Last Name is required.'),
  statusGuid: yup.string().required('Status is required.')
})

const NonDistrictEmployeeTab = ({dropdownOptions, onChange, headerRef}): JSX.Element => {
  const [apiResult, setApiResult] = useState<ApiResult>()

  function handleInstructorAddition (instructor) {
    instructor = {
      ...instructor,
      firstName: instructor.firstName.trim(),
      lastName: instructor.lastName.trim()
    }

    onChange(instructor)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  return (
    
    <Formik
      validationSchema={schema}
      onSubmit={(values, actions) => {
        handleInstructorAddition(values)
        actions.setSubmitting(false)
        actions.resetForm()
      }}
      initialValues={{
        firstName: '',
        lastName: '',
        statusGuid: ''
      }}
    >
      {({
        handleSubmit,
        handleChange,
        setFieldValue,
        values, 
        touched, 
        isValid,
        errors
      }) => (
        <Form
          noValidate
          onSubmit={handleSubmit}
          className='h-50'
        >
          <ApiResultAlert apiResult={apiResult} scroll={false} />
          <Row>
            <Form.Group as={Col} controlId='validationFormik-firstName'>
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                type='text' 
                name='firstName'
                value={values.firstName}
                onChange={handleChange}
                isValid={touched.firstName && !errors.firstName}
                isInvalid={touched.firstName && !!errors.firstName}
              />
              <Form.Control.Feedback type='invalid'>
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId='validationFormik-lastName'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control 
                type='text' 
                name='lastName'
                value={values.lastName}
                onChange={handleChange}
                isValid={touched.lastName && !errors.lastName}
                isInvalid={touched.lastName && !!errors.lastName}
              />
              <Form.Control.Feedback type='invalid'>
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId='validationFormik-statusGuid'>
              <Form.Label >Status</Form.Label>
              <Form.Control 
                as={'div'}
                className='p-0'
                style={{height: 'min-content'}}
                isValid={touched.statusGuid && !errors.statusGuid}
                isInvalid={touched.statusGuid && !!errors.statusGuid}
              >
              <Dropdown 
                id='statusGuid'
                className='border-0'
                value={values.statusGuid}
                options={dropdownOptions}
                onChange={(guid: string) => setFieldValue('statusGuid', guid)}
              />
              </Form.Control>
              <Form.Control.Feedback type='invalid'>
                {errors.statusGuid}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className='justify-content-left my-3 mx-0'>
            <Button type='submit' style={{width: 'fit-content'}}>Submit</Button>
          </Row>
        </Form>
      )}
    </Formik>
  )
}

const DistrictEmployeeTab = ({dropdownOptions, onChange, headerRef}) => {  
  const [state, setState] = useState<any[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()
  
  function handleInstructorSearch (name: string, badgeNumber: string) {
    fetchSynergyInstructors(name, badgeNumber)
      .then(res => setState(res))
      .catch(err => console.warn(err))
  }

  function handleChange (instructor) {
    instructor = {
      ...instructor,
      firstName: instructor.firstName.trim(),
      lastName: instructor.lastName.trim(),
      badgeNumber: instructor.badgeNumber.trim()
    }

    onChange(instructor)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  const columns: Column[] = columnsBuilder(handleChange, dropdownOptions)

  return (
    <>
      <ApiResultAlert apiResult={apiResult}  scroll={false} />
      <Container>
        <Search handleChange={handleInstructorSearch} />
      </Container>
      <Container className='my-3'>
        <Table columns={columns} dataset={state} />
      </Container>
    </>
  )
}

//they need to be able to handle users viewing their changes on 'review changes'
// intercept and use addInstructor as a callback after pushing results to a list
//variant - attendance/default
export default ({ show, orgYearGuid, handleClose, onInternalChange, onExternalChange, variant = 'default' }): JSX.Element => {
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])
  const headerRef = useRef<any>(null)
  const isAttendanceVariant: boolean = variant === 'attendance' ? true : false

  useEffect(() => {
    fetchStatusDropdownOptions()
      .then(res => setOptions(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <Modal show={show} onHide={handleClose} centered size='xl' scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          Adding New Instructor(s)...
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='d-flex flex-column align-items-center'>
        <Tab.Container defaultActiveKey='internal'>
          <Row className='w-75' ref={headerRef}>
            <Nav variant='tabs' className='justify-content-around'>
              {
                isAttendanceVariant 
                ? <Nav.Item>
                    <Nav.Link eventKey='existing'>Existing Employees</Nav.Link>
                  </Nav.Item>
                : <></>
              }
              
              <Nav.Item>
                <Nav.Link eventKey='internal'>District Employees</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='external'>Non-District Employees</Nav.Link>
              </Nav.Item>
            </Nav>
          </Row>
          <Row  className='w-75'>
            <Tab.Content className='py-3'>
              {
                isAttendanceVariant 
                ? <Tab.Pane eventKey='existing'>
                    <ExistingEmployeeTab orgYearGuid={orgYearGuid} onChange={onInternalChange} headerRef={headerRef} />
                  </Tab.Pane>
                : <></>
              }
              <Tab.Pane eventKey='internal'>
                <DistrictEmployeeTab dropdownOptions={dropdownOptions} onChange={onInternalChange} headerRef={headerRef} />
              </Tab.Pane>
              <Tab.Pane eventKey='external'>
                <NonDistrictEmployeeTab dropdownOptions={dropdownOptions} onChange={onExternalChange} headerRef={headerRef} />
              </Tab.Pane>
            </Tab.Content>
          </Row>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>Close</Button>
      </Modal.Footer>

    </Modal>
  )
}

