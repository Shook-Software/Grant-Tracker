import { useState, useEffect, useRef } from 'react'
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'

import { DataTable } from 'components/DataTable'
import { Button } from 'components/ui/button'
import { FormControl } from 'components/Form'

import { DropdownOption } from 'Models/Session'
import { DateTime } from 'Models/DateTime'

import api from 'utils/api'
import { ColumnDef } from '@tanstack/react-table'
import { Grip } from 'lucide-react'

//we need an isActive field so that dropdown options can be retired.
const Dropdown = ({ type, state: initialState, reloadOptions }): JSX.Element => {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(initialState?.map(x => ({ ...x })) || [])
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
      setDropdownOptions(e.values.map((value, idx) => ({ ...value, displayOrder: idx })))
    },
  })

  // Columns for DataTable (view mode only)
  const viewColumns: ColumnDef<DropdownOption>[] = [
    {
      header: 'Label',
      accessorKey: 'label',
      cell: ({ row }) => row.original.label
    },
    {
      header: 'Abbreviation',
      accessorKey: 'abbreviation',
      cell: ({ row }) => row.original.abbreviation
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => row.original.description
    },
    {
      header: 'Deactivated At',
      accessorKey: 'deactivatedAt',
      cell: ({ row }) => {
        const option = row.original
        return option.deactivatedAt ? DateTime.toLocalTime(option.deactivatedAt).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : ''
      }
    }
  ]

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
      .map((value, idx) => ({ ...value, displayOrder: idx }))
    )
  }

  const submitChanges = async (): Promise<any> => {
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
      .then(res => Promise.all(additions.map(x => api.post(`developer/dropdown?type=${type}`, x))))
      .then(res => setEdit(false))
      .catch(err => setChangesHaveError(true))
      .finally(() => {
        setChangesPending(false)
        reloadOptions()
      })
  }

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
    return <div className="flex justify-center items-center h-20">Loading...</div>

  return (
    <div className='relative'>
      <div className='mb-3 flex gap-3'>
        {
          edit
            ?
            <>
              <Button onClick={() => submitChanges()}>Submit</Button>
              <Button variant="outline" onClick={() => setEdit(false)}>Cancel</Button>
            </>
            : <Button onClick={() => setEdit(true)}>Edit</Button>
        }
        {
          edit ?
            <Button variant='secondary' onClick={() => sortAlphabetically()}>Sort Alphabetically</Button>
            : null
        }
      </div>

      <div className='text-red-500'>
        {
          changesHaveError ? 'An unhandled error occured.' : ''
        }
      </div>

      <ul ref={body} className={`w-full border border-gray-200 rounded absolute ${edit ? 'left-[0px] right-[0px]' : 'left-[9999px] right-[9999px]'}`}> 
        {/*Silly solution to ensure formkit drag and drop initializes appropriately rather than on a null element ^^^ */}
        <li id='no-drag' className='bg-gray-50 border-b border-gray-200 flex items-center py-2'>
          <div className='flex-[2] px-3 font-medium'>Label</div>
          <div className='flex-1 px-3 font-medium'>Abbreviation</div>
          <div className='flex-[2] px-3 font-medium'>Description</div>
          <div className='flex-1 px-3 font-medium'>Deactivated At</div>
          <div className='w-16 px-3 font-medium'>Reorder</div>
        </li>
        {rows?.map((option, idx) =>
          <li key={option.guid} className='border-b border-gray-200 flex items-center py-2 hover:bg-gray-50'>
            <div className='flex-[2] px-3'>
              <FormControl
                maxLength={75}
                value={option.label ?? ''}
                onChange={(e) => handleChange({ ...option, label: e.target.value })}
              />
            </div>
            <div className='flex-1 px-3'>
              <FormControl
                maxLength={10}
                value={option.abbreviation ?? ''}
                onChange={(e) => handleChange({ ...option, abbreviation: e.target.value })}
              />
            </div>
            <div className='flex-[2] px-3'>
              <FormControl
                as='textarea'
                maxLength={400}
                value={option.description ?? ''}
                onChange={(e) => handleChange({ ...option, description: e.target.value })}
              />
            </div>
            <div className='flex-1 px-3'>
              <label className='flex items-center gap-2'>
                <input
                  type="checkbox"
                  checked={!option.deactivatedAt}
                  onChange={(e) => handleChange({ ...option, deactivatedAt: e.target.checked ? null : LocalDateTime.now() })}
                  className='rounded'
                />
                Active
              </label>
            </div>
            <div className='w-16 px-3'>
              <div className='drag-handle cursor-move'><Grip aria-hidden /></div>
            </div>
          </li>
        )}
      </ul>
      {!edit &&
        <DataTable
          columns={viewColumns}
          data={dropdownOptions || []}
          emptyMessage="No dropdown options found."
          className="hover:bg-gray-50"
          containerClassName="w-full"
        />
      }

      <div className='mt-3'>
        {
          edit
            ? <Button variant="outline" onClick={() => setDropdownOptions([...dropdownOptions, { guid: null, label: '', abbreviation: '', description: '', deactivatedAt: null }])}>Add</Button>
            : null
        }
      </div>
    </div>
  )
}

export default (): JSX.Element => {
  document.title = 'GT - Config / Dropdowns'
  const [state, setState] = useState([])
  const [activeTab, setActiveTab] = useState('activities')

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
    return <div className="flex justify-center items-center h-20">Loading...</div>


  const tabs = [
    { key: 'activities', label: 'Activities', type: 0, data: state.activities },
    { key: 'objectives', label: 'Objectives', type: 1, data: state.objectives },
    { key: 'fundingSources', label: 'Funding Sources', type: 2, data: state.fundingSources },
    { key: 'instructorStatus', label: 'Instructor Status', type: 3, data: state.instructorStatuses },
    { key: 'organizationTypes', label: 'Organization Types', type: 4, data: state.organizationTypes },
    { key: 'partnershipTypes', label: 'Partnership Types', type: 5, data: state.partnershipTypes },
    { key: 'sessionTypes', label: 'Session Types', type: 6, data: state.sessionTypes }
  ]

  const currentTab = tabs.find(tab => tab.key === activeTab)

  return (
    <div className='flex gap-6 pt-6'>
      <div className='w-36 flex-shrink-0'>
        <nav className='flex flex-col gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors select-none ${activeTab === tab.key
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className='flex-1'>
        {currentTab && (
          <Dropdown
            type={currentTab.type}
            state={currentTab.data}
            reloadOptions={loadOptions}
          />
        )}
      </div>
    </div>
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
