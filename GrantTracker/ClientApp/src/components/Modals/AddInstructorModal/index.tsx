import { useState, useEffect, forwardRef, useRef } from 'react'
import { Formik } from 'formik'
import * as yup from 'yup'

import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Search from './Search'
import ApiResultAlert, { ApiResult } from 'components/ApiResultAlert'

import { StaffDto } from 'types/Dto'
import { DropdownOption } from 'types/Session'
import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'


import { fetchStatusDropdownOptions, fetchSynergyInstructors, fetchGrantTrackerInstructors } from './api'
//An easy way to add an instructor from Synergy to the GrantTracker.
//Pop up over the table, set the instructor status, then submit.
const InstructorPopover = ({ values, dropdownOptions, handleAddInstructor }): JSX.Element => {
  const [status, setStatus] = useState<string>('')
  const [open, setOpen] = useState(false)

  const fullName: string = `${values.firstName} ${values.lastName}`
  const labelFor: string = `${fullName}-status`

  const handleSubmit = (event) => {
    event.preventDefault()
    const newInstructor: StaffDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      badgeNumber: values.badgeNumber,
      title: values.title,
      statusGuid: status
    }
    handleAddInstructor(newInstructor)
    setOpen(false)
    setStatus('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" onClick={() => setOpen(true)}>+</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">{fullName}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={labelFor}>Instructor Status:</Label>
              <Select value={status} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger id={labelFor}>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.map((option) => (
                    <SelectItem key={option.guid} value={option.guid}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={status === ''}
              type='submit'
              size="sm"
            >
              Add Instructor
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const synergyInstructorColumns = (handleAddInstructor, dropdownOptions): ColumnDef<any, any>[] => ([
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <HeaderCell 
        label="First Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'firstName'
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <HeaderCell 
        label="Last Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'lastName'
  },
  {
    accessorKey: 'organizationName',
    header: ({ column }) => (
      <HeaderCell 
        label="Organization" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'organizationName'
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <HeaderCell 
        label="Job Title" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'title'
  },
  {
    accessorKey: 'badgeNumber',
    header: ({ column }) => (
      <HeaderCell 
        label="Badge Number" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'badgeNumber'
  },
  {
    id: 'actions',
    header: () => <HeaderCell label="Add" />,
    cell: ({ row }) => (
      <div className='flex justify-center relative'>
        <InstructorPopover 
          values={row.original} 
          dropdownOptions={dropdownOptions} 
          handleAddInstructor={handleAddInstructor} 
        />
      </div>
    ),
    enableSorting: false
  }
])

const existingInstructorColumns = (handleAddInstructor): ColumnDef<InstructorSchoolYearView, any>[] => ([
  {
    accessorFn: (row) => row.instructor.firstName,
    header: ({ column }) => (
      <HeaderCell 
        label="First Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'firstName'
  },
  {
    accessorFn: (row) => row.instructor.lastName,
    header: ({ column }) => (
      <HeaderCell 
        label="Last Name" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'lastName'
  },
  {
    accessorFn: (row) => row.instructor.badgeNumber,
    header: ({ column }) => (
      <HeaderCell 
        label="Badge Number" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'badgeNumber'
  },
  {
    accessorFn: (row) => row.status.label,
    header: ({ column }) => (
      <HeaderCell 
        label="Status" 
        sort={column.getIsSorted()} 
        onSortClick={() => column.toggleSorting()} 
      />
    ),
    id: 'status'
  },
  {
    id: 'actions',
    header: () => <HeaderCell label="" />,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Button 
          size="sm"
          onClick={() => handleAddInstructor({...row.original.instructor, statusGuid: row.original.status.guid}, row.original.guid)}
        >
          +
        </Button>
      </div>
    ),
    enableSorting: false
  }
])

const ExistingEmployeeTab = ({orgYearGuid, onChange, headerRef}): JSX.Element => {
  const [instructors, setInstructors] = useState<any[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()

  function handleInstructorAddition (instructor, instructorSchoolYearGuid) {
    onChange(instructor, instructorSchoolYearGuid)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  const columns = existingInstructorColumns(handleInstructorAddition)

  useEffect(() => {
    fetchGrantTrackerInstructors(orgYearGuid)
      .then(res => setInstructors(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <div className="space-y-4">
      <ApiResultAlert apiResult={apiResult} scroll={true} />
      <div className="max-h-96 overflow-auto">
        <DataTable 
          columns={columns} 
          data={instructors} 
          initialSorting={[{ id: 'lastName', desc: false }]}
          containerClassName="w-full"
          tableClassName="table-auto"
        />
      </div>
    </div>
  )
}

const schema = yup.object().shape({
  firstName: yup.string().required('First Name is required.'),
  lastName: yup.string().required('Last Name is required.'),
  statusGuid: yup.string().required('Status is required.')
})

const NonDistrictEmployeeTab = ({dropdownOptions, onChange, headerRef}): JSX.Element => {
  const [apiResult, setApiResult] = useState<ApiResult>()

  function handleInstructorAddition (instructor) {
    instructor = {
      ...instructor,
      firstName: instructor.firstName.trim(),
      lastName: instructor.lastName.trim()
    }

    onChange(instructor)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  return (
    <Formik
      validationSchema={schema}
      onSubmit={(values, actions) => {
        handleInstructorAddition(values)
        actions.setSubmitting(false)
        actions.resetForm()
      }}
      initialValues={{
        firstName: '',
        lastName: '',
        statusGuid: ''
      }}
    >
      {({
        handleSubmit,
        handleChange,
        setFieldValue,
        values, 
        touched, 
        isValid,
        errors
      }) => (
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <ApiResultAlert apiResult={apiResult} scroll={false} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor='firstName'>First Name</Label>
              <Input 
                id='firstName'
                type='text' 
                name='firstName'
                value={values.firstName}
                onChange={handleChange}
                className={`${
                  touched.firstName && errors.firstName ? 'border-red-500' : 
                  touched.firstName && !errors.firstName ? 'border-green-500' : ''
                }`}
              />
              {touched.firstName && errors.firstName && (
                <p className='text-sm text-red-500'>{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor='lastName'>Last Name</Label>
              <Input 
                id='lastName'
                type='text' 
                name='lastName'
                value={values.lastName}
                onChange={handleChange}
                className={`${
                  touched.lastName && errors.lastName ? 'border-red-500' : 
                  touched.lastName && !errors.lastName ? 'border-green-500' : ''
                }`}
              />
              {touched.lastName && errors.lastName && (
                <p className='text-sm text-red-500'>{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor='statusGuid'>Status</Label>
              <Select 
                value={values.statusGuid} 
                onValueChange={(value) => setFieldValue('statusGuid', value)}
              >
                <SelectTrigger 
                  id='statusGuid'
                  className={`${
                    touched.statusGuid && errors.statusGuid ? 'border-red-500' : 
                    touched.statusGuid && !errors.statusGuid ? 'border-green-500' : ''
                  }`}
                >
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.map((option) => (
                    <SelectItem key={option.guid} value={option.guid}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.statusGuid && errors.statusGuid && (
                <p className='text-sm text-red-500'>{errors.statusGuid}</p>
              )}
            </div>
          </div>
          <div className='flex justify-start'>
            <Button type='submit'>Submit</Button>
          </div>
        </form>
      )}
    </Formik>
  )
}

const DistrictEmployeeTab = ({dropdownOptions, onChange, headerRef}) => {  
  const [state, setState] = useState<any[]>([])
  const [apiResult, setApiResult] = useState<ApiResult>()
  
  function handleInstructorSearch (name: string, badgeNumber: string) {
    fetchSynergyInstructors(name, badgeNumber)
      .then(res => setState(res))
      .catch(err => console.warn(err))
  }

  function handleChange (instructor) {
    instructor = {
      ...instructor,
      firstName: instructor.firstName.trim(),
      lastName: instructor.lastName.trim(),
      badgeNumber: instructor.badgeNumber.trim(),
      title: instructor.title.trim()
    }

    onChange(instructor)
      .then(res => setApiResult(res))
      .catch(err => setApiResult(err))
      .finally(() => headerRef.current.scrollIntoView())
  }

  const columns = synergyInstructorColumns(handleChange, dropdownOptions)

  return (
    <div className="space-y-4">
      <ApiResultAlert apiResult={apiResult} scroll={false} />
      <div>
        <Search handleChange={handleInstructorSearch} />
      </div>
      <div className="max-h-96 overflow-auto">
        <DataTable 
          columns={columns} 
          data={state} 
          initialSorting={[{ id: 'lastName', desc: false }]}
          containerClassName="w-full"
          tableClassName="table-auto"
        />
      </div>
    </div>
  )
}

//they need to be able to handle users viewing their changes on 'review changes'
// intercept and use addInstructor as a callback after pushing results to a list
//variant - attendance/default
export default ({ show, orgYearGuid, handleClose, onInternalChange, onExternalChange, variant = 'default' }): JSX.Element => {
  const [dropdownOptions, setOptions] = useState<DropdownOption[]>([])
  const headerRef = useRef<any>(null)
  const isAttendanceVariant: boolean = variant === 'attendance' ? true : false

  useEffect(() => {
    fetchStatusDropdownOptions()
      .then(res => setOptions(res))
      .catch(err => console.warn(err))
  }, [])

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-x-hidden overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            Adding New Instructor(s)...
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-center overflow-auto'>
          <Tabs defaultValue={isAttendanceVariant ? "existing" : "internal"} className='w-full'>
            <div ref={headerRef}>
              <TabsList className='grid w-full grid-cols-2 md:grid-cols-3'>
                {isAttendanceVariant && (
                  <TabsTrigger value='existing'>Existing Employees</TabsTrigger>
                )}
                <TabsTrigger value='internal'>District Employees</TabsTrigger>
                <TabsTrigger value='external'>Non-District Employees</TabsTrigger>
              </TabsList>
            </div>
            <div className='py-6'>
              {isAttendanceVariant && (
                <TabsContent value='existing'>
                  <ExistingEmployeeTab orgYearGuid={orgYearGuid} onChange={onInternalChange} headerRef={headerRef} />
                </TabsContent>
              )}
              <TabsContent value='internal'>
                <DistrictEmployeeTab dropdownOptions={dropdownOptions} onChange={onInternalChange} headerRef={headerRef} />
              </TabsContent>
              <TabsContent value='external'>
                <NonDistrictEmployeeTab dropdownOptions={dropdownOptions} onChange={onExternalChange} headerRef={headerRef} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

