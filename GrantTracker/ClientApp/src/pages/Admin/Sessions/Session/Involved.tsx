import { Context } from 'pages/Admin/Sessions/SessionEditor'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

import api from 'utils/api'
import { useQuery } from '@tanstack/react-query'

//Second Section - Instructor/Funding
////Instructor -- Searchable Dropdown
////Instructor Status -- Dropdown
////Funding Source -- Multiple Response
////Organization Type -- Dropdown
////Partnership Type -- Dropdown

export default ({ context }: { context: Context }): JSX.Element => {
  const { reducerDispatch, dropdownData, values, orgYearGuid } = context
  document.title = `${values.guid ? 'Edit' : 'New'} Session - Involved`

  if (!values)
    return (
      <p style={{ textAlign: 'center' }}>Error in loading Session details...</p>
    )

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors', orgYearGuid, values.instructors],
    queryFn: async () => {
      const res = await api.get('instructor', { params: { orgYearGuid } })

      // Filter out already selected instructors
      const filtered = res.data.filter(
        item => !values.instructors.find(value => value.guid === item.guid)
      )

      // Sort alphabetically by lastName, then firstName
      const sorted = filtered.sort((a, b) => {
        const lastNameCompare = a.instructor.lastName.localeCompare(b.instructor.lastName)
        if (lastNameCompare !== 0) return lastNameCompare
        return a.instructor.firstName.localeCompare(b.instructor.firstName)
      })

      // Map to DropdownOption format
      return sorted.map(isy => ({
        guid: isy.guid,
        label: `${isy.instructor.firstName} ${isy.instructor.lastName}`
      }))
    }
  })

  function handleInstructorAddition (guid: string, label: string): void {
    if (!values.instructors.find(i => i.guid === guid))
      reducerDispatch({ type: 'addInstructor', payload: { guid, label } })
  }

  function handleInstructorRemoval (guid: string): void {
    reducerDispatch({ type: 'removeInstructor', payload: guid })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className="space-y-2">
          <Label htmlFor="partnership-type">Partnership Type</Label>
          <Select
            value={values.partnershipType}
            onValueChange={(value: string) =>
              reducerDispatch({ type: 'partnership', payload: value })
            }
          >
            <SelectTrigger id="partnership-type">
              <SelectValue placeholder="Select partnership type" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.partnershipTypes.map(option => (
                <SelectItem key={option.guid} value={option.guid}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="funding-source">Funding Source</Label>
          <Select
            value={values.fundingSource}
            onValueChange={(value: string) =>
              reducerDispatch({ type: 'funding', payload: value })
            }
          >
            <SelectTrigger id="funding-source">
              <SelectValue placeholder="Select funding source" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.fundingSources.map(option => (
                <SelectItem key={option.guid} value={option.guid}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization-type">Organization Type</Label>
          <Select
            value={values.organizationType}
            onValueChange={(value: string) =>
              reducerDispatch({ type: 'organization', payload: value })
            }
          >
            <SelectTrigger id="organization-type">
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.organizationTypes.map(option => (
                <SelectItem key={option.guid} value={option.guid}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className="space-y-2">
          <Label htmlFor="instructors">Instructor(s)</Label>
          <Combobox
            id="instructors"
            options={instructors.map(instructor => ({
              value: instructor.guid,
              label: instructor.label
            }))}
            value=""
            onChange={(selected) => {
              if (selected && typeof selected === 'string') {
                const instructor = instructors.find(i => i.guid === selected)
                if (instructor) {
                  handleInstructorAddition(instructor.guid, instructor.label)
                }
              }
            }}
            placeholder='Search instructors...'
            emptyText='No instructors found'
          />
        </div>

        <div className="space-y-2">
          <Label>Selected Instructors</Label>
          <div className='flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md'>
            {values.instructors.length === 0 ? (
              <span className="text-muted-foreground text-sm">No instructors selected</span>
            ) : (
              values.instructors.map(instructor => (
                <Badge key={instructor.guid} variant="secondary" className="flex items-center gap-1">
                  {instructor.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleInstructorRemoval(instructor.guid)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/*

            <SearchDropdown
              values={values.instructors}
              label={'Select Instructor...'}
              onChange={handleInstructorAddition}
            />
            */
