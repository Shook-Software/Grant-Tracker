import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageContainer } from 'styles'
import { ApiResult } from 'components/ApiResultAlert'
import { Spinner } from '@/components/ui/Spinner'
import RegistrationsView from './RegistrationsView'
import AttendanceHistory from './AttendanceHistory'

import { Session, SessionDomain, SessionView } from 'Models/Session'
import { SimpleAttendanceView } from 'Models/StudentAttendance'

import api from 'utils/api'
import { getSimpleAttendanceRecords } from './api'

////
//Refactoring imports, temporary location
import Header from './Header'
import Overview from './Overview'
import Instructors from './Instructors'
import Scheduling from './Scheduling'
import { User } from 'utils/authentication'
import { StudentGroup } from 'Models/StudentGroup'

interface Props {
  sessionGuid: string
  user: User
}

type TabType = 'overview' | 'registrations' | 'attendance'

//Nice to have - Calender visual view, but only something to *come back to*
export default ({ sessionGuid, user }: Props): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [session, setSession] = useState<SessionView | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<SimpleAttendanceView[]>([])
  const [attendanceApiResult, setAttendanceApiResult] = useState<ApiResult | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Get current tab from URL params, default to 'overview'
  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'overview'
  
  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab })
  }

  function getAttendance() {
    getSimpleAttendanceRecords(sessionGuid)
      .then(records => {
        setAttendanceRecords(records)
      })
  }

  function getSessionDetails (): void {
    setIsLoading(true)
    setSession(null)
    api
      .get<SessionDomain>(`session/${sessionGuid}`)
      .then(res => {
        const session: SessionView = Session.toViewModel(res.data)
        setSession(session)
        document.title = `GT - Admin / Session / ${session.name}`
      })
      .catch(err => console.warn(err))
      .finally(() => setIsLoading(false))
  }

  /// /Effects

  useEffect(() => {
    window.scrollTo(0, 0)
    setAttendanceApiResult(undefined)
    getSessionDetails()
    getAttendance()
  }, [sessionGuid])

  //Spin while no data exists and no error is thrown in loading.
  //Display error if loading fails
  if (!session && isLoading) 
    return (
      <div className="flex flex-col items-center space-y-2 p-6">
        <Spinner size='lg' />
        <small className='text-gray-600'>Loading Session...</small>
      </div>
    )
  else if (!session && !isLoading) return (
    <div className='flex justify-center items-center p-6'>
      <p className='text-red-600'>An error occurred while loading the session.</p>
    </div>
  )

  const TabNavigation = () => (
    <div className='flex border-b border-gray-200 mb-6'>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          currentTab === 'overview'
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        onClick={() => setActiveTab('overview')}
      >
        Overview
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          currentTab === 'registrations'
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        onClick={() => setActiveTab('registrations')}
      >
        Registrations
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          currentTab === 'attendance'
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        onClick={() => setActiveTab('attendance')}
      >
        Attendance
      </button>
    </div>
  )

  const OverviewTab = () => (
    <div className='space-y-6'>
      {/* Overview and Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-6'>
          <Overview session={session!} />
        </div>
        <div className='space-y-6'>
          <Scheduling session={session} />
          <Instructors session={session} />
        </div>
      </div>
    </div>
  )

  const RegistrationsTab = () => (
    <div>
      <RegistrationsView
        sessionGuid={sessionGuid}
        daySchedules={session?.daySchedules || []}
        studentGroups={session?.instructors.reduce((list, isy) => [...list, ...isy.studentGroups], [] as StudentGroup[]) || []}
      />
    </div>
  )

  const AttendanceTab = () => (
    <div className='p-3'>
      <AttendanceHistory 
        sessionGuid={sessionGuid}
        sessionName={session!.name}
        attendanceRecords={attendanceRecords} 
        onChange={() => getAttendance()} 
        sessionType={session!.sessionType.label.toLowerCase()}
      />
    </div>
  )

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab />
      case 'registrations':
        return <RegistrationsTab />
      case 'attendance':
        return <AttendanceTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <PageContainer className='shadow-lg rounded-sm px-2'>
      <div className='space-y-6'>
        {/* Header Section */}
        <Header session={session} attendanceApiResult={attendanceApiResult} user={user} />
        
        {/* Tab Navigation */}
        <TabNavigation />
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </PageContainer>
  )
}