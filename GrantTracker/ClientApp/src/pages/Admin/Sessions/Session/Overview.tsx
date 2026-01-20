import React from 'react'
import { Context } from 'pages/Admin/Sessions/SessionEditor'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'

export default ({ context }: { context: Context }): JSX.Element => {
  const { reducerDispatch, dropdownData, values }: Context = context
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Overview`

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )
  //make a formcomponents file and handle accordingly on feedback from Liz on editing here and there
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        <div className="space-y-2">
          <Label htmlFor="session-name">Name</Label>
          <Input
            id="session-name"
            required
            type='text'
            name='name'
            placeholder='Session Name..'
            value={values.name}
            onChange={(event: React.BaseSyntheticEvent) => {
              //handleChange(event.target.value)
              reducerDispatch({ type: 'name', payload: event.target.value })
            }}
          />
          {/* A session name is required! */}
        </div>

        <div className="space-y-2">
          <Label htmlFor="session-type">Type</Label>
          <Select
            value={values.type}
            onValueChange={(value: string) => {
              reducerDispatch({ type: 'type', payload: value })
            }}
          >
            <SelectTrigger id="session-type">
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.sessionTypes.map(option => (
                <SelectItem key={option.guid} value={option.guid}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex justify-center">
          <div className="w-full max-w-[200px]">
            <Label htmlFor="objectives">Objective</Label>
            <Combobox
              id="objectives"
              options={dropdownData.objectives.map(obj => ({
                value: obj.guid,
                label: `(${obj.abbreviation}) ${obj.label}`
              }))}
              value={values.objectives}
              onChange={(selected) => {
                reducerDispatch({ type: 'objective', payload: selected })
              }}
              placeholder='Select objectives...'
              emptyText='No objectives found'
              multiple={true}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity">Activity</Label>
          <Select
            value={values.activity}
            onValueChange={(value: string) => {
              reducerDispatch({ type: 'activity', payload: value })
            }}
          >
            <SelectTrigger id="activity">
              <SelectValue placeholder="Select activity" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.activities.map(option => (
                <SelectItem key={option.guid} value={option.guid}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        <div className="space-y-2">
          <Label htmlFor="grades">Grades</Label>
          <div className="max-w-[200px]">
            <Combobox
              id="grades"
              options={dropdownData.grades.map(grade => ({
                value: grade.guid,
                label: grade.label
              }))}
              value={values.grades}
              onChange={(selected) => {
                reducerDispatch({ type: 'grades', payload: selected })
              }}
              placeholder='Select grades...'
              emptyText='No grades found'
              multiple={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
