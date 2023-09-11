import { useState, useEffect } from 'react'
import { Tab, Nav, Row, Col, Form } from 'react-bootstrap'

import Table, { Column } from 'components/BTable'

import { DropdownOption } from 'Models/Session'

import api from 'utils/api'
import { patchDropdownOptions } from './api'
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
const Dropdown = ({ state }): JSX.Element => {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(state || [])
  const [editable, setEditable] = useState<boolean>(false)

  const handleChange = (editedOption: DropdownOption): void => {
    const editedOptions: DropdownOption[] = dropdownOptions.map(option => {
      if (option.guid !== editedOption.guid)
        return option
      else return editedOption
    })

    setDropdownOptions(editedOptions)
  }

  const submitChanges = (): void => {
    const edits = filterUneditedOptions(state, dropdownOptions)
    console.log(state, edits)
  }


  const columns: Column[] = editable ? createEditColumns(handleChange) : displayColumns

  useEffect(() => {
    setDropdownOptions(state)
  }, [state])

  if (!state) return <></>

  /*<button onClick={() => submitChanges()}>Submit Changes</button>*/

  return (
    <>
      <button onClick={() => setEditable(true)}>Edit</button>
      <button onClick={() => setEditable(false)}>Unedit</button>
      
      <Table dataset={dropdownOptions} columns={columns} />
    </>
  )
}

export default (): JSX.Element => {
  document.title = 'GT - Config / Dropdowns'
  const [state, setState] = useState([])
  const style = { cursor: 'pointer' }

  useEffect(() => {
    api
      .get('developer/dropdowns')
      .then(res => {
        setState(res.data)
      })
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
                eventKey='grades'
              >
                Grades
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
              <Dropdown state={state.activities} />
            </Tab.Pane>

            <Tab.Pane eventKey='fundingSources'>
              <Dropdown state={state.fundingSources} />
            </Tab.Pane>

            <Tab.Pane eventKey='grades'>
              <Dropdown state={state.grades} />
            </Tab.Pane>

            <Tab.Pane eventKey='instructorStatus'>
              <Dropdown state={state.instructorStatuses} />
            </Tab.Pane>

            <Tab.Pane eventKey='objectives'>
              <Dropdown state={state.objectives} />
            </Tab.Pane>

            <Tab.Pane eventKey='organizationTypes'>
              <Dropdown state={state.organizationTypes} />
            </Tab.Pane>

            <Tab.Pane eventKey='partnershipTypes'>
              <Dropdown state={state.partnershipTypes} />
            </Tab.Pane>

            <Tab.Pane eventKey='sessionTypes'>
              <Dropdown state={state.sessionTypes} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}
