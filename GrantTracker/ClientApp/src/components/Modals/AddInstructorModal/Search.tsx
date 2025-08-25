import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Filter {
  name: string
  badgeNumber: string
}

interface Props {
  handleChange: (name: string, badgeNumber: string) => void
}

export default ({ handleChange }: Props): JSX.Element => {
  const [filter, setFilter] = useState<Filter>({
    name: '',
    badgeNumber: ''
  })

  function filterStaff(): void {
    handleChange(filter.name, filter.badgeNumber)
  }

  return (
    <form 
      onSubmit={(event) => {
        event.preventDefault()
        filterStaff()
      }}
      className="mb-4"
    >
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type='text'
            name='name'
            value={filter.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setFilter({ ...filter, name: event.target.value }) }}
            placeholder="Enter name..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badgeNumber">Badge Number</Label>
          <Input
            id="badgeNumber"
            type='text'
            name='badgeNumber'
            value={filter.badgeNumber}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setFilter({ ...filter, badgeNumber: event.target.value }) }}
            placeholder="Enter badge number..."
          />
        </div>
        <div> 
          <Button type='submit'>Search</Button>
        </div>
      </div>
    </form>
  )
}