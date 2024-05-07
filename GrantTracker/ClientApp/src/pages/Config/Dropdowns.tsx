import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core'

import Table, { Column } from 'components/BTable'

import { DropdownOption } from 'Models/Session'
import { DateTime } from  'Models/DateTime'

import api from 'utils/api'
import isDeepEqual from 'deep-equal'

const displayColumns: Column[] = [
  {
    label: 'Label',
    attributeKey: 'label',
    sortable: true
  },
  {
    label: 'Abbreviation',
    attributeKey: 'abbreviation',
    sortable: true
  },
  {
    label: 'Description',
    attributeKey: 'description',
    sortable: false
  },
  {
    label: 'Deactivated Date',
    attributeKey: 'deactivatedAt',
    sortable: true,
    transform: (date) => date ? DateTime.toLocalTime(date).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : ''
  }
]

//not all dropdowns have consistency. They need to have a label of 75nvarchar, likely. Some are 50, some are 75. Fix this in the database
//same with abbv, Activity has 20nvarchar where others have 10
const createEditColumns = (onChange: (DropdownOption) => void): Column[] => [
  {
    label: 'Label',
    attributeKey: '',
    key: 'edit-label',
    sortable: true,
    transform: (dropdownOption: DropdownOption) => {
      return (
        <Form.Control 
          maxLength={75}
          value={dropdownOption.label}
          onChange={(e) => onChange({...dropdownOption, label: e.target.value})}
        />
      )
    }
  },
  {
    label: 'Abbreviation',
    attributeKey: '',
    key: 'edit-abbv',
    sortable: true,
    transform: (dropdownOption: DropdownOption) => {
      return (
        <Form.Control 
          maxLength={10}
          value={dropdownOption.abbreviation}
          onChange={(e) => onChange({...dropdownOption, abbreviation: e.target.value})}
        />
      )
    }
  },
  {
    label: 'Description',
    attributeKey: '',
    key: 'edit-description',
    sortable: false,
    transform: (dropdownOption: DropdownOption) => {
      return (
        <Form.Control
          as='textarea'
          rows={2}
          maxLength={400}
          value={dropdownOption.description}
          onChange={(e) => onChange({...dropdownOption, description: e.target.value})}
        />
      )
    }
  },
  {
    label: 'Active',
    attributeKey: '',
    key: 'edit-description',
    sortable: false,
    transform: (dropdownOption: DropdownOption) => {
      return ( 
        <Form.Check 
          type="checkbox" 
          label="Active" 
          checked={!dropdownOption.deactivatedAt} 
          onChange={(e) => onChange({...dropdownOption, deactivatedAt: e.target.checked ? null : LocalDateTime.now()})}
        />
      )
    }
  }
]

  //assumes both arrays stay in the same order
const filterUneditedOptions = (originalOptions: DropdownOption[], editedOptions: DropdownOption[]): DropdownOption[] => {
  let filteredOptions: DropdownOption[] = []

  //only return those with changes
  for (let index = 0; index < originalOptions.length; index++) {
    const originalOption: DropdownOption = originalOptions[index]
    const editedOption: DropdownOption = editedOptions[index]
    if (!isDeepEqual(originalOption, editedOption))
      filteredOptions = [...filteredOptions, editedOption]
  }

  return filteredOptions
}

//we need an isActive field so that dropdown options can be retired.
const Dropdown = ({ type, state, reloadOptions }): JSX.Element => {  
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(state?.map(x => ({...x})) || [])
  const [edit, setEdit] = useState<boolean>(false)
  const [changesHaveError, setChangesHaveError] = useState<boolean>(false)
  const [changesPending, setChangesPending] = useState<boolean>(false)

  const handleChange = (editedOption: DropdownOption): void => {
    const editedOptions: DropdownOption[] = dropdownOptions.map(option => {
      if (option.guid !== editedOption.guid)
        return option
      else return editedOption
    })

    setDropdownOptions(editedOptions)
  }

  const submitChanges = async (): Promise<any> => {
    const edits = filterUneditedOptions(state, dropdownOptions)
    const additions = dropdownOptions.slice(state.length).filter(x => x.label.trim() != '' || x.abbreviation?.trim() != '')
    setChangesHaveError(false)
    setChangesPending(true)

    console.log(edits, additions)

    const promises: Promise<any>[] = [
        ...edits.map(x => api.patch(`developer/dropdown?type=${type}`, x)),
        ...additions.map(x => api.post(`developer/dropdown?type=${type}`, x))
    ]

    return Promise.all(promises)
        .then(res => setEdit(false))
        .catch(err => setChangesHaveError(true))
        .finally(() => {
            setChangesPending(false)
            reloadOptions()
        })
  }

  const columns: Column[] = edit ? createEditColumns(handleChange) : displayColumns

  useEffect(() => {
    setDropdownOptions(state)
  }, [state])

  useEffect(() => {
    if (!edit)
        setDropdownOptions(state)
  }, [edit])

  if (!state || type === undefined) return <></>

  if (changesPending)
    <Spinner />

  return (
    <>
        <div className='mb-3'>
            {
                edit
                ?
                <>
                    <Button className="me-3" onClick={() => submitChanges()}>Submit</Button>
                    <Button onClick={() => setEdit(false)}>Cancel</Button>
                </>
                :  <Button onClick={() => setEdit(true)}>Edit</Button>
            }
        </div>

        <div className='text-danger'>
            {
                changesHaveError ? 'An unhandled error occured.' : ''
            }
        </div>
      
        <Table dataset={dropdownOptions} columns={columns} />

        <div className='mt-3'>
            {
                edit
                ?
                    <Button onClick={() => setDropdownOptions([...dropdownOptions, {guid: null, label: '', abbreviation: '', description: '', deactivatedAt: null}])}>Add</Button>
                : null
            }
        </div>
    </>
  )
}

export default (): JSX.Element => {
  document.title = 'GT - Config / Dropdowns'
  const [state, setState] = useState([])
  const style = { cursor: 'pointer' }

  const loadOptions = () => {
    api
      .get('developer/dropdowns')
      .then(res => {
        setState(res.data)
      })
  }

  useEffect(() => {
    loadOptions()
  }, [])

  return (
    <Tab.Container defaultActiveKey='activities'>
      <Row className='p-3'>
        <Col lg={3}>
          <Nav variant='pills' className='flex-column'>
            <Nav.Item>
              <Nav.Link className='user-select-none' eventKey='activities'>
                Activities
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='fundingSources'
              >
                Funding Sources
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='instructorStatus'
              >
                Instructor Status
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='objectives'
              >
                Objectives
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='organizationTypes'
              >
                Organization Types
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='partnershipTypes'
              >
                Partnership Types
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                className='user-select-none'
                style={style}
                eventKey='sessionTypes'
              >
                Session Types
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col lg={9}>
          <Tab.Content>
            <Tab.Pane eventKey='activities'>
              <Dropdown type={0} state={state.activities} reloadOptions={loadOptions} />
            </Tab.Pane>

            <Tab.Pane eventKey='objectives'>
              <Dropdown type={1} state={state.objectives} reloadOptions={loadOptions} />
            </Tab.Pane>

            <Tab.Pane eventKey='fundingSources'>
              <Dropdown type={2} state={state.fundingSources}  reloadOptions={loadOptions}/>
            </Tab.Pane>

            <Tab.Pane eventKey='instructorStatus'>
              <Dropdown type={3} state={state.instructorStatuses}  reloadOptions={loadOptions}/>
            </Tab.Pane>

            <Tab.Pane eventKey='organizationTypes'>
              <Dropdown type={4} state={state.organizationTypes} reloadOptions={loadOptions} />
            </Tab.Pane>

            <Tab.Pane eventKey='partnershipTypes'>
              <Dropdown type={5} state={state.partnershipTypes} reloadOptions={loadOptions} />
            </Tab.Pane>

            <Tab.Pane eventKey='sessionTypes'>
              <Dropdown type={6} state={state.sessionTypes} reloadOptions={loadOptions} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}
