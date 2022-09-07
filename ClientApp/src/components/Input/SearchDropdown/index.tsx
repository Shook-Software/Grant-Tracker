import { BaseSyntheticEvent, useEffect, useState, useRef } from 'react'
import { Form, InputGroup, Container } from 'react-bootstrap'

import Dropdown from 'components/Input/Dropdown'

import { DropdownOption } from 'types/Session'
import api from 'utils/api'

export default ({ values, label, onChange }): JSX.Element => {
  const [state, setState] = useState<DropdownOption[]>([])
  const [filter, setFilter] = useState({ name: '' })
  const [showDropdown, setShowDropdown] = useState<boolean>(false)

  const containerRef = useRef(null)

  function searchInstructors(): void {
    api.get('staff/get', { params: filter })
      .then(res => {
        res.data = res.data.filter(item => !values.find(value => value.guid === item.guid))
        setState(res.data.map(instructor => ({
          guid: instructor.guid,
          label: `${instructor.firstName} ${instructor.lastName}`
        })))
      })
      .catch(err => console.warn(err))
  }

  function handleInstructorChange(value: string): void {
    const label: string = state.find(s => s.guid === value)?.label || ''
    onChange(value, label)
  }

  useEffect(() => {
    searchInstructors()
  }, [filter])

  useEffect(() => {
    setState(state.filter(item => !values.find(value => value.guid === item.guid)))
  }, [values])

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (containerRef.current) {
        if (!containerRef.current.contains(event.target as Node)) {
          setShowDropdown(false)
        }
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return (() => {
      document.removeEventListener('click', handleDocumentClick, true)
    })
  }, [])

  return (
    <div className='d-flex flex-column' ref={containerRef} style={{ maxWidth: '250px' }}>
      <InputGroup>
        <InputGroup.Text>Search...</InputGroup.Text>
        <Form.Control
          type='text'
          value={filter.name}
          onChange={(event: BaseSyntheticEvent) => setFilter({ ...filter, name: event.target.value })}
        />
      </InputGroup>
      <Container className='position-relative'>
        <Dropdown
          className='position-absolute'
          value={label}
          options={state}
          show={showDropdown}
          onChange={handleInstructorChange}
          style={{ left: '0px' }}
          disableOverlay
        />
      </Container>
    </div>
  )
}