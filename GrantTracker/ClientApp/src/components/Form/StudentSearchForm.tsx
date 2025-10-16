import { useContext, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/Spinner'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'

import api from 'utils/api'
import { OrgYearContext } from 'pages/Admin'
import { DropdownOption } from 'types/Session'

interface Filter {
  firstName: string
  lastName: string
  grades: string[]
}

interface Props {
  orgYearGuid: string
  handleChange: (sessions) => void
}

export default ({ orgYearGuid, handleChange }: Props): JSX.Element => {
  const { orgYear } = useContext(OrgYearContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [grades, setGrades] = useState<Option[]>([])
  const [filter, setFilter] = useState<Filter>({
    firstName: '',
    lastName: '',
    grades: []
  })

  function filterStudents(): void {
    setIsLoading(true)
    api
      .get('student/synergy', { params: { ...filter, organizationYearGuid: orgYearGuid } })
      .then(res => handleChange(res.data))
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchGradeOptions()
      .then(res => {
        setGrades(res.map(grade => ({ value: grade.guid, label: grade.label })))
      })
  }, [])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setIsLoading(true)
        filterStudents()
      }}
      className='space-y-4'
    >
      {/* Main search fields */}
      <div className='flex flex-col sm:flex-row gap-4 items-end'>
        <div className='flex-1 space-y-2'>
          <Input
            type='text'
            id='first-name'
            value={filter.firstName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilter({ ...filter, firstName: event.target.value })
            }}
            placeholder='First name'
          />
        </div>
        
        <div className='flex-1 space-y-2'>
          <Input
            type='text'
            id='last-name'
            value={filter.lastName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilter({ ...filter, lastName: event.target.value })
            }}
            placeholder='Last name'
          />
        </div>
        
        <div className='flex-shrink-0'>
          <Button type='submit' disabled={isLoading} className='min-w-[100px]'>
            {isLoading && <Spinner size='sm' className='mr-2' />}
            Search
          </Button>
        </div>
      </div>
      
      {/* Grades filter */}
      <div className='space-y-2'>
        <div className='max-w-xs'>
          <MultipleSelector
            value={grades.filter(grade => filter.grades.includes(grade.value))}
            options={grades}
            onChange={(values: Option[]) => {
              setFilter({...filter, grades: values.map(v => v.value)})
            }}
            placeholder='Filter grades'
          />
        </div>
      </div>
    </form>
  )
}

function fetchGradeOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
	api.get<DropdownOption[]>('dropdown/view/grades')
		.then(res => { resolve(res.data) })
		.catch(err => {
			console.warn(err)
			reject([])
		})
  })
}