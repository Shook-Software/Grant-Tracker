import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'

import { Tabset, Tab } from 'components/Tabset'
import { PageContainer } from 'styles'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'

import { OrganizationYear, OrganizationYearDomain, OrganizationYearView, Quarter, YearView } from 'Models/OrganizationYear'

import { IdentityClaim, User } from 'utils/authentication'
import paths from 'utils/routing/paths'
import api from 'utils/api'
import { SimpleSessionView } from 'Models/Session'
import { InstructorSchoolYearView, InstructorView } from 'Models/Instructor'
import { DateOnly } from 'Models/DateOnly'
import { AppContext } from 'App'
import { DaySchedule } from 'Models/DaySchedule'

const TabSelector = ({user}: {user: User}): JSX.Element => (
  <Tabset basePath={paths.Admin.path}>
    <Tab
      path={paths.Admin.Tabs.Overview.path}
      text='Overview'
      disabled={user.claim == IdentityClaim.Teacher}
    />
    <Tab
      path={paths.Admin.Tabs.Sessions.path}
      text='Sessions'
    />
    <Tab
      path={paths.Admin.Tabs.Staff.path}
      text='Staff'
      disabled={user.claim == IdentityClaim.Teacher}
    />
    <Tab
      path={paths.Admin.Tabs.Students.path}
      text='Students'
    />
    <Tab
      path={paths.Admin.Tabs.Config.path}
      text='Config'
      disabled={user.claim == IdentityClaim.Teacher}
    />
  </Tabset>
)

interface IOrgYearContext {
  orgYear: OrganizationYearView | undefined
  sessionsQuery: UseQueryResult<SimpleSessionView[], Error> | undefined
  instructorsQuery: UseQueryResult<InstructorSchoolYearView[], Error> | undefined
  setOrgYear: (orgYear: OrganizationYearView) => void
}

export const OrgYearContext = createContext<IOrgYearContext>({
  orgYear: undefined,
  sessionsQuery: undefined,
  instructorsQuery: undefined,
  setOrgYear: (orgYear) => {}
})

export default () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(AppContext)
  const [orgYear, setOrgYear] = useState<OrganizationYearView>()

  const sessionsQuery = useQuery<SimpleSessionView[]>({
      queryKey: [`session?orgYearGuid=${orgYear?.guid}`],
      enabled: !!orgYear?.guid,
      select: (sessions) => sessions.map(session => ({
          ...session,
          firstSessionDate: DateOnly.toLocalDate(session.firstSessionDate as unknown as DateOnly),
          lastSessionDate: DateOnly.toLocalDate(session.lastSessionDate as unknown as DateOnly),
          daySchedules: session.daySchedules.map(ds => DaySchedule.toViewModel(ds))
      })) 
  })

  const instructorsQuery = useQuery<InstructorSchoolYearView[]>({
      queryKey: [`instructor?orgYearGuid=${orgYear?.guid}`],
      enabled: !!orgYear?.guid
  })

  function handleOrgYearChange(orgYear) {
    if (!user) return
    setOrgYear(orgYear)
    user.setOrganizationYear(orgYear)
    setUser(user)
  }

  const orgYearContextValue = { orgYear, sessionsQuery, instructorsQuery, setOrgYear: handleOrgYearChange }

  useEffect(() => {
    if (location.pathname === paths.Admin.path) {
      navigate(paths.Admin.Tabs.Overview.path)
    }
  }, [location.pathname])

  useEffect(() => {
    if (user && user.organizationYear) {
      const userOrgYear = user.organizationYear
      if (!orgYear || orgYear.guid !== userOrgYear.guid) {
        setOrgYear(userOrgYear)
      }
    }
  }, [user?.organizationYear?.guid])

  if (!user || !user.organizationYear) {
    return <div>Loading user...</div>
  }

  return (
    <PageContainer className='rounded-top-left-0'>
      <OrgYearInput value={orgYear} onChange={handleOrgYearChange} defaultOrgYearGuid={user.organizationYear.guid} />
      <div className='w-full'>
        <TabSelector user={user} />
      </div>
      <OrgYearContext.Provider value={orgYearContextValue}>
        {orgYear ? <Outlet /> : 'Loading organizations...'}
      </OrgYearContext.Provider>
    </PageContainer>
  )
}

function getOrgYear(
  orgYears: OrganizationYearView[] | undefined, 
  orgGuid: string | undefined, 
  yearGuid: string| undefined
): OrganizationYearView | undefined {
  if (!orgYears || !orgGuid || !yearGuid)
    return undefined

  return orgYears.find(oy => oy.organization.guid === orgGuid && oy.year.guid === yearGuid)
}

const OrgYearInput = ({value, onChange, defaultOrgYearGuid}): React.ReactElement => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useContext(AppContext)
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) {
    return <div>Loading...</div>
  }

  const orgYears: OrganizationYearView[] = user.organizationYears || []

  function handleInputChange(
    orgYears: OrganizationYearView[] | undefined, 
    orgGuid: string | undefined, 
    yearGuid: string| undefined
  ): void {
    const selectedOrgYear: OrganizationYearView | undefined = getOrgYear(orgYears, orgGuid, yearGuid)

    if (selectedOrgYear && selectedOrgYear.guid != value.guid && location.pathname.match(/\/home\/admin\/sessions\/([A-Z]?[a-z]?[0-9]?-?)+/))
    {
      navigate(`/home/admin/sessions?oyGuid=${selectedOrgYear.guid}`)
    }

    handleOrgYearChange(selectedOrgYear)
  }

  function handleOrgYearChange(newOrgYear: OrganizationYearView | undefined) {
    if (!newOrgYear || newOrgYear.guid === value?.guid)
      return

    onChange(newOrgYear)
  }

  useEffect(() => {
    if (!value && orgYears) {

      let defaultOrgYear = searchParams.get('oyGuid') 
        ? orgYears.find(x => x.guid === searchParams.get('oyGuid')) 
        : orgYears.find(x => x.guid === defaultOrgYearGuid)

      handleOrgYearChange(defaultOrgYear)

      searchParams.delete('oyGuid')
      setSearchParams(searchParams)
    }
  }, [orgYears])

  const orgGuids: string[] = [...(new Set(orgYears.map(x => x.organization.guid)))]
  const orgs: any[] = orgGuids.map(guid => orgYears.find(oy => oy.organization.guid === guid)?.organization)
  const years: YearView[] = orgYears.filter(oy => oy.organization.guid === value?.organization.guid)
    .map(oy => oy.year)
		.sort((curr, next) => {
			if (curr.schoolYear == next.schoolYear)
				return curr.quarter > next.quarter ? -1 : 1
			
			return curr.schoolYear > next.schoolYear ? -1 : 1
		})

  return (
    <div className='flex flex-wrap gap-4 mb-3'>

      <div className='w-fit max-w-xs'>
        <Label className='mb-3' htmlFor='org-select'>Organization</Label>
        <Combobox 
          id='org-select'
          options={orgs.map(o => ({ value: o.guid, label: o.name }))}
          value={value?.organization.guid || ''}
          onChange={(selectedValue) => handleInputChange(orgYears, selectedValue, value?.year.guid)}
          placeholder="Search organizations..."
          emptyText="No organizations found"
        />
      </div>

      <div className='w-fit max-w-xs'>
        <Label className='mb-3' htmlFor='term-select'>Term</Label>
        <Combobox 
          id='term-select'
          options={years.map(y => ({ value: y.guid, label: `${y.schoolYear} - ${Quarter[y.quarter]}` }))}
          value={value?.year.guid || ''}
          onChange={(selectedValue) => handleInputChange(orgYears, value?.organization.guid, selectedValue)}
          placeholder="Search terms..."
          emptyText="No terms found"
        />
      </div>

    </div>
  )
}