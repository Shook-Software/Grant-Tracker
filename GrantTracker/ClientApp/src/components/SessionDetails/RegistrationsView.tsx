import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { DataTable } from '@/components/DataTable'
import { HeaderCell } from '@/components/ui/table'

import { DayOfWeek } from 'Models/DayOfWeek'
import { StudentSchoolYearWithRecordsView, StudentView } from 'Models/Student'
import { StudentRegistration, StudentRegistrationDomain, StudentRegistrationView } from 'Models/StudentRegistration'
import { StudentGroup, StudentGroupStudent } from 'Models/StudentGroup'
import { addStudentToSession } from './api'
import { DayScheduleView } from 'Models/DaySchedule'

import SearchStudentsModal from './SearchStudentsModal'
import { OrgYearContext } from 'pages/Admin'
import api from 'utils/api'
import { Loader2Icon, User, UserMinus, UserPlus, Users } from 'lucide-react'

function groupRegistrationsByStudent (registrations: StudentRegistrationView[]): RegistrationByStudent[] {
  const registrationsByStudent: object = {}

  registrations.forEach(reg => {
    const student: StudentView = reg.studentSchoolYear.student;

    registrationsByStudent[student.guid] = {
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        studentSchoolYearGuid: reg.studentSchoolYear.guid,
        matricNumber: student.matricNumber
      },
      daysOfWeek: reg.schedule.map(day => DayOfWeek.toChar(day.dayOfWeek)),
      days: reg.schedule
    }
  })

  return Object.keys(registrationsByStudent).map(key => {
    let student = registrationsByStudent[key]

    student.days = student.days.sort((first, second) => {
      let firstDay = DayOfWeek.toInt(first.dayOfWeek)
      let secondDay = DayOfWeek.toInt(second.dayOfWeek)

      if (firstDay < secondDay) return -1
      else if (firstDay > secondDay) return 1

      return 0
    })

    student.daysOfWeek = student.daysOfWeek.sort((first, second) => {
      let firstDay = DayOfWeek.charToInt(first)
      let secondDay = DayOfWeek.charToInt(second)
      if (firstDay < secondDay) return -1
      else if (firstDay > secondDay) return 1

      return 0
    })

    return student
  })
}

interface RegistrationByStudent {
  student: StudentSchoolYearWithRecordsView
  daysOfWeek: string[]
  days: any[]
}

interface Props {
  sessionGuid: string
  daySchedules: DayScheduleView[]
  studentGroups: StudentGroup[]
}

export default ({
  sessionGuid,
  daySchedules,
  studentGroups
}: Props): JSX.Element => {
  const navigate = useNavigate()
  const { orgYear } = useContext(OrgYearContext)
  const [modalData, setModalData] = useState(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
  const [registrations, setRegistrations] = useState<StudentRegistrationView[]>([])

  const [studentGroupState, setStudentGroupState] = useState({
    selectedGroup: null as StudentGroup | null,
    schedules: [] as string[]
  })
  const [studentGroupAPIState, setStudentGroupAPIState] = useState({
    isPending: false,
    issues: [] as StudentGroupStudent[]
  })

  function handleStudentRemoval (values): void {
    setShowModal(true)
    setModalData(values)
  }

  function handleClose (scheduleGuids: string[], studentSchoolYearGuid: string) {
    if (scheduleGuids?.length !== 0) {
      removeStudentRegistrationsAsync(scheduleGuids, studentSchoolYearGuid)
      .then(res => {
        getStudentRegistrationsAsync()
      })
    }

    setShowModal(false)
  }

  function addStudent(studentSchoolYearGuid: string, schedule): Promise<void> {
    return addStudentToSession(sessionGuid, studentSchoolYearGuid, schedule)
      .then(res => getStudentRegistrationsAsync())
  }

  function addStudentGroup(studentGroup: StudentGroup | null, schedule) {
    if (!studentGroup)
      return;

    setStudentGroupAPIState({ isPending: true, issues: [] })

    Promise.allSettled(studentGroup.students.map(stu => addStudent(stu.studentSchoolYearGuid, schedule)))
      .then(res => {
        setStudentGroupAPIState({ isPending: false, issues: [...res.map((r, idx) => r.status == 'rejected' ? studentGroup.students[idx] : null).filter(student => !!student)] })
      })
      .finally(() => getStudentRegistrationsAsync())
  }

  function getStudentRegistrationsAsync (): void {
    api
      .get<StudentRegistrationDomain[]>(`session/${sessionGuid}/student/registration`)
      .then(res => {
        const registrations: StudentRegistrationView[] = res.data.map(item => StudentRegistration.toViewModel(item))
        setRegistrations(registrations)
      })
      .catch(err => {
        console.warn(err)
      })
  }

  function removeStudentRegistrationsAsync (scheduleGuids: string[], studentSchoolYearGuid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      api
        .delete('session/student/registration', {
          params: {
            studentSchoolYearGuid,
            dayScheduleGuid: scheduleGuids
          }
        })
        .then(res => {resolve()})
        .catch(err => {reject()})
        .finally(() => getStudentRegistrationsAsync())
    })
  }

  useEffect(() => {
    getStudentRegistrationsAsync()
  }, [])

  const dataset = groupRegistrationsByStudent(registrations || [])
  const distinctStudentGroups: StudentGroup[] = Array.from(new Set(studentGroups.map(g => g.groupGuid))).map(guid => studentGroups.find(g => g.groupGuid == guid) as StudentGroup)

  return ( 
    <Card className='border-0'>
      <CardHeader>
        <CardTitle className='text-lg font-medium'>Student Registrations</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Tabs defaultValue="individual">
          <TabsList className={!distinctStudentGroups || distinctStudentGroups.length === 0 ? 'hidden' : 'flex'}>
            <TabsTrigger value="individual">Individual <User /></TabsTrigger>
            <TabsTrigger value="groups">Group <Users /></TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            <Button 
              onClick={() => setShowStudentModal(true)}
              variant='outline'
            >
              Add 
              <UserPlus />
            </Button>
          </TabsContent>
          <TabsContent value="groups">
            <div className='space-y-4'>
              <form 
                className='space-y-4' 
                onSubmit={(e) => {
                  e.preventDefault()
                  addStudentGroup(studentGroupState.selectedGroup, studentGroupState.schedules)
                }}
              >
                <div className='flex flex-col w-full'>
                  <div className='flex items-end w-full gap-2'>
                    <div>
                      <Label htmlFor='student-group-select'>Student Group</Label>
                      <Combobox
                        id='student-group-select'
                        className='min-w-64'
                        options={distinctStudentGroups?.map(option => ({value: option.groupGuid, label: option.name})) || []}
                        value={studentGroupState.selectedGroup?.groupGuid || ''}
                        onChange={(value) => setStudentGroupState(state => ({
                          ...state, 
                          selectedGroup: studentGroups.find(g => g.groupGuid === value) || null
                        }))}
                        placeholder='Search student groups...'
                        emptyText='No student groups found'
                      />
                    </div>

                    <Button 
                      type='submit' 
                      disabled={studentGroupAPIState.isPending || !studentGroupState.selectedGroup || studentGroupState.schedules.length === 0}
                      variant='outline'
                    >
                      {studentGroupAPIState.isPending ? <Loader2Icon className="animate-spin" /> : 'Add Student Group'}
                    </Button>
                  </div>
                
                  <div className='mt-3'>
                    <Label>Days to Register</Label>
                    <div className='flex flex-wrap gap-3'>
                      {daySchedules?.map(day => (
                        <div key={day.dayOfWeek} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`day-${day.dayOfWeek}`}
                            checked={!!studentGroupState.schedules.find(guid => guid === day.dayScheduleGuid)}
                            onCheckedChange={(checked) => {
                              if (checked)
                                setStudentGroupState(state => ({
                                  ...state, 
                                  schedules: Array.from(new Set([...state.schedules, day.dayScheduleGuid]))
                                }))
                              else
                                setStudentGroupState(state => ({
                                  ...state, 
                                  schedules: state.schedules.filter(guid => guid !== day.dayScheduleGuid)
                                }))
                            }}
                          />
                          <Label 
                            htmlFor={`day-${day.dayOfWeek}`} 
                            className='text-sm font-normal cursor-pointer'
                          >
                            {day.dayOfWeek}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Error Messages */}
              {studentGroupAPIState.issues.length > 0 && (
                <div className='bg-red-50 border border-red-200 rounded-md p-3 space-y-1'>
                  {studentGroupAPIState.issues.map((issue, index) => (
                    <div key={index} className='text-red-700 text-sm'>
                      {`${issue.firstName} ${issue.lastName} ${registrations.some(reg => reg.studentSchoolYear.guid === issue.studentSchoolYearGuid) ? 'is already registered' : 'cannot be added'}.`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {/* Add Student Group Section */}
        

        {/* Students Table */}
        <div className='space-y-2'>
          <StudentRegistrationsTable 
            dataset={dataset}
            onRemoveStudent={handleStudentRemoval}
            onRowClick={(row) => navigate(`/home/admin/students/${row.student.studentSchoolYearGuid}`)}
          />
        </div>

        <RemoveStudentModal
          registration={modalData}
          show={showModal}
          handleClose={handleClose}
        />
      </CardContent>
      
      <SearchStudentsModal
        orgYearGuid={orgYear.guid}
        show={showStudentModal}
        handleClose={() => setShowStudentModal(false)}
        handleChange={({student, schedule}) => addStudent(student.guid, schedule)}
        scheduling={daySchedules}
      />
    </Card>
  )
}

// StudentRegistrationsTable Component
interface StudentRegistrationsTableProps {
  dataset: RegistrationByStudent[]
  onRemoveStudent: (registration: RegistrationByStudent) => void
  onRowClick: (row: RegistrationByStudent) => void
}

const StudentRegistrationsTable = ({ dataset, onRemoveStudent, onRowClick }: StudentRegistrationsTableProps): JSX.Element => {
  const columns: ColumnDef<RegistrationByStudent>[] = [
    {
      accessorKey: 'student.firstName',
      header: 'First Name',
      enableSorting: true,
      id: 'firstName'
    },
    {
      accessorKey: 'student.lastName', 
      header: 'Last Name',
      enableSorting: true,
      id: 'lastName'
    },
    {
      accessorKey: 'student.matricNumber',
      header: 'Matric #',
      enableSorting: true
    },
    {
      accessorKey: 'daysOfWeek',
      header: () => <HeaderCell label="Registrations" />,
      cell: ({ row }) => row.original.daysOfWeek.join(', '),
      enableSorting: false
    },
    {
      header: '',
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button 
            size='sm' 
            variant='destructive'
            onClick={(event) => {
              event.stopPropagation()
              onRemoveStudent(row.original)
            }}
            aria-label={`Unregister ${row.original.student.firstName} ${row.original.student.lastName}`}
          >
            <UserMinus />
          </Button>
        </div>
      ),
      id: 'actions',
      enableSorting: false
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={dataset}
      initialSorting={[{
        id: 'firstName',
        desc: false
      }, {
        id: 'lastName',
        desc: false
      }]}
      emptyMessage="No student registrations found."
      onRowClick={onRowClick}
      containerClassName='w-full'
    />
  )
}

const RemoveStudentModal = ({
  registration,
  show,
  handleClose
}): JSX.Element => {
  const [selectedRemovals, setRemovals] = useState<string[]>([])

  function handleChange (checked: boolean, day): void {
    if (checked) {
      setRemovals([...selectedRemovals, day.dayScheduleGuid])
    } else {
      setRemovals(selectedRemovals.filter(guid => guid !== day.dayScheduleGuid))
    }
  }

  useEffect(() => {
    if (show && registration)
      setRemovals(registration.days.map(day => day.dayScheduleGuid))
  }, [registration, show])

  if (!registration) return <></>

  return (
    <Dialog open={show} onOpenChange={() => handleClose([], '')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Remove {registration.student.firstName} {registration.student.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Select which days to remove this student from:
          </p>
          
          <div className='space-y-3'>
            {registration.days.map((day, index) => (
              <div key={index} className='flex items-center space-x-2'>
                <Checkbox
                  id={`remove-${day.dayOfWeek}`}
                  checked={selectedRemovals.includes(day.dayScheduleGuid)}
                  onCheckedChange={(checked) => handleChange(checked, day)}
                />
                <Label 
                  htmlFor={`remove-${day.dayOfWeek}`}
                  className='cursor-pointer'
                >
                  {day.dayOfWeek}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleClose([], '')}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleClose(selectedRemovals, registration.student.studentSchoolYearGuid)}
            disabled={selectedRemovals.length === 0}
          >
            Remove from Selected Days
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


