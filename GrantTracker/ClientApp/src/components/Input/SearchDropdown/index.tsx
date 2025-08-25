import { BaseSyntheticEvent, useEffect, useState, useRef } from 'react'

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
    <div className='flex flex-col' ref={containerRef} style={{ maxWidth: '250px' }}>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          Search...
        </span>
        <input
          type='text'
          className="roundehidden rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
          value={filter.name}
          onChange={(event: BaseSyntheticEvent) => setFilter({ ...filter, name: event.target.value })}
        />
      </div>
      <div className='relative'>
        <Dropdown
          className='absolute'
          value={label}
          options={state}
          show={showDropdown}
          onChange={handleInstructorChange}
          style={{ left: '0px' }}
          disableOverlay
        />
      </div>
    </div>
  )
}