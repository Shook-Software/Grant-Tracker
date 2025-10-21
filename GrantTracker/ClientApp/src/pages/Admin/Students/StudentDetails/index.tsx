import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock } from 'lucide-react'

import { Spinner } from 'components/ui/Spinner'
import { ComboboxDropdownMenu, ComboboxDropdownMenuItem, ComboboxDropdownMenuItemClassName } from 'components/Dropdown'

import BasicDetails from './BasicDetails'
import RegistrationDetails from './RegistrationDetails'
import AttendanceDetails from './AttendanceDetails'

import { Quarter } from 'Models/OrganizationYear'
import { StudentSchoolYear, StudentSchoolYearWithRecordsView, StudentSchoolYearWithRecordsDomain, StudentView } from 'Models/Student'

import api from 'utils/api'
import paths from 'utils/routing/paths'

//info needed:
//basic student info
//Student aggregates

//registrations
//attendance history, default sorted by date
//

export default ({studentGuid}): JSX.Element => {
  const [studentSchoolYear, setStudentSchoolYear] = useState<StudentSchoolYearWithRecordsView | null>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    //get student details
    setIsLoading(true)

    api
      .get<StudentSchoolYearWithRecordsDomain>(`student/${studentGuid}`)
      .then(res => {
        document.title = `GT - Admin / Student / ${res.data.student.firstName} ${res.data.student.lastName}`
        setStudentSchoolYear(StudentSchoolYear.toViewModel(res.data))
      })
      .catch()
      .finally(() => setIsLoading(false))
  }, [studentGuid])

  if (isLoading) 
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spinner variant="border" />
        <div className="text-sm text-muted-foreground mt-2">Loading Student Details...</div>
      </div>
    )
  else if (!studentSchoolYear) 
    return (
      <div className='flex justify-center py-8'>
        <p className='text-destructive'>An error occurred while loading the student.</p>
      </div>
    )

  const student: StudentView = studentSchoolYear.student

  return (
    <div>
      {/* Header with Actions Menu */}
      <header className="space-y-4 mb-6">
        <div className='flex justify-center items-center gap-4'>
          <div className="text-center">
            <h1 className='text-3xl font-bold'>
              {student.firstName} {student.lastName}
            </h1>
            <div className="text-muted-foreground space-y-1">
              <div className="font-small flex gap-3">
                <span>{studentSchoolYear.organizationYear.organization.name}</span>
                <span>{studentSchoolYear.organizationYear.year.schoolYear} - {Quarter[studentSchoolYear.organizationYear.year.quarter]}</span>
              </div>
            </div>
          </div>

          <ComboboxDropdownMenu aria-label="Student actions menu">
            <div className={ComboboxDropdownMenuItemClassName}>
              <Link 
                className='block w-full' 
                to={`${paths.Admin.path}/${paths.Admin.Tabs.Students.path}`}
                aria-label="Close student details and return to students list"
              >
                Close
              </Link>
            </div>
          </ComboboxDropdownMenu>
        </div>
      </header>

      <div>
        <section>
          <BasicDetails studentSchoolYear={studentSchoolYear} minutes={studentSchoolYear.minutesAttended} />
        </section>

        <hr className="my-6" />

        {/* Registrations */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Registrations
          </h2>
          <RegistrationDetails registrations={studentSchoolYear.registrations} />
        </section>

        <hr className="my-6" />

        {/* Attendance */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance
          </h2>
          <AttendanceDetails attendance={studentSchoolYear.attendance} />
        </section>
      </div>
    </div>
  )
}
