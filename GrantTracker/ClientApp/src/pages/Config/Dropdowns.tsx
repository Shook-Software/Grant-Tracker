import { useState, useEffect, useRef } from 'react'
import { Tab, Nav, Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'

import Table, { Column } from 'components/BTable'

import { DropdownOption } from 'Models/Session'
import { DateTime } from  'Models/DateTime'

import api from 'utils/api'

//we need an isActive field so that dropdown options can be retired.
const Dropdown = ({ type, state: initialState, reloadOptions }): JSX.Element => {  
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(initialState?.map(x => ({...x})) || [])
  const [edit, setEdit] = useState<boolean>(false)
  const [changesHaveError, setChangesHaveError] = useState<boolean>(false)
  const [changesPending, setChangesPending] = useState<boolean>(false)

  const [body, rows, setValues, updateConfig] = useDragAndDrop<HTMLUListElement, DropdownOption>(dropdownOptions || [], {
    dragHandle: '.drag-handle',
    sortable: true,
    draggable: (el) => {
      return el.id !== 'no-drag'
    },
    onSort: (e) => {
      setDropdownOptions(e.values.map((value, idx) => ({...value, displayOrder: idx})))
    }
  })

  const handleChange = (editedOption: DropdownOption): void => {
    const editedOptions: DropdownOption[] = dropdownOptions.map(option => {
      if (option.guid !== editedOption.guid)
        return option
      else return editedOption
    })

    setDropdownOptions(editedOptions)
  }

  const sortAlphabetically = (): void => {
    setDropdownOptions([...dropdownOptions
      .sort((a, b) => (a.abbreviation ?? a.label) > (b.abbreviation ?? b.label) ? 1 : -1)]
      .map((value, idx) => ({...value, displayOrder: idx}))
    )
  }

  const submitChanges = async (): Promise<any> => {
    console.log(dropdownOptions)
    const orderedOptions = dropdownOptions.map((value, idx) => ({
      ...value, 
      displayOrder: idx,
      deactivatedAt: !!value.deactivatedAt ? DateTime.toLocalTime(value.deactivatedAt) : value.deactivatedAt
    }))
    const additions = orderedOptions.filter(option => !option.guid).filter(x => x.label.trim() != '')
    setChangesHaveError(false)
    setChangesPending(true)

    const editBatchPromise: Promise<any> = api.patch(`developer/dropdown?type=${type}`, orderedOptions.filter(option => !!option.guid))

    return editBatchPromise
        .then(res => Promise.all(additions.map(x => api.post(`developer/dropdown?type=${type}`, x))) )
        .then(res => setEdit(false))
        .catch(err => setChangesHaveError(true))
        .finally(() => {
            setChangesPending(false)
            reloadOptions()
        })
  }

  //const columns: Column[] = edit ? createEditColumns(handleChange) : displayColumns

  useEffect(() => {
    setDropdownOptions(initialState)
  }, [initialState])

  useEffect(() => {
    if (!edit)
        setDropdownOptions(initialState)
  }, [edit])

  useEffect(() => {
    setValues(dropdownOptions || [])
  }, [dropdownOptions])


  if (!initialState || type === undefined) return <></>

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
            {
              edit ? 
                <Button className='ms-3' variant='secondary' onClick={() => sortAlphabetically()}>Sort Alphabetically</Button>
              : null
            }
        </div>

        <div className='text-danger'>
            {
                changesHaveError ? 'An unhandled error occured.' : ''
            }
        </div>
      
        <ul ref={body} className='container list-group'>
            <li id='no-drag' className='list-group-item row d-flex'>
              <div className='col-4 px-1'>Label</div>
              <div className='col-2 px-1'>Abbreviation</div>
              <div className='col-3 px-1'>Description</div>
              <div className='col-2 px-1'>Deactivated At</div>
              {edit 
                ? <div className='col-1 px-1'>Reorder</div>
                : null
              }
            </li>
            {rows?.map((option, idx) => 
            <li key={option.guid} className='list-group-item row d-flex'>
              <div className='col-4 px-1'>
                {edit 
                  ? <Form.Control 
                    maxLength={75}
                    value={option.label}
                    onChange={(e) => handleChange({...option, label: e.target.value})}
                  />
                  :  option.label
                }
              </div>
              <div className='col-2 px-1'>
                {edit 
                  ? <Form.Control 
                    maxLength={10}
                    value={option.abbreviation}
                    onChange={(e) => handleChange({...option, abbreviation: e.target.value})}
                  />
                  :  option.abbreviation
                }
              </div>
              <div className='col-3 px-1'>
                {edit 
                  ? <Form.Control
                    as='textarea'
                    rows={2}
                    maxLength={400}
                    value={option.description}
                    onChange={(e) => handleChange({...option, description: e.target.value})}
                  />
                  :  option.description
                }
              </div>
              <div className='col-2 px-1'>
                {edit 
                  ? <Form.Check 
                    type="checkbox" 
                    label="Active" 
                    checked={!option.deactivatedAt} 
                    onChange={(e) => handleChange({...option, deactivatedAt: e.target.checked ? null : LocalDateTime.now()})}
                  />
                  :  option.deactivatedAt? DateTime.toLocalTime(option.deactivatedAt).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : ''
                }
              </div>
              {edit 
                ? <div className='col-auto px-1'>
                  <div className='drag-handle'><i className='bi bi-grip-horizontal' /></div>
                </div>
                : null 
              }
            </li>
            )}
        </ul>  

        <div className='mt-3'>
            {
                edit
                ? <Button onClick={() => setDropdownOptions([...dropdownOptions, {guid: null, label: '', abbreviation: '', description: '', deactivatedAt: null}])}>Add</Button>
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

  if (state.length == 0)
    return <Spinner />

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


/*
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
    transform: (date) => date 
  },
  {
    label: 'Order',
    sortable: false,
    attributeKey: 'displayOrder'
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
]*/
