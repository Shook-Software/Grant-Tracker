import { createContext, useEffect, useState } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'

import Select from 'react-select'
import { Tabset, Tab } from 'components/Tabset'
import { PageContainer } from 'styles'

import { OrganizationYear, OrganizationYearDomain, OrganizationYearView, Quarter, YearView } from 'Models/OrganizationYear'

import { User } from 'utils/authentication'
import paths from 'utils/routing/paths'
import api from 'utils/api'

const TabSelector = (): JSX.Element => (
  <Tabset basePath={paths.Admin.path}>
    <Tab
      path={paths.Admin.Tabs.Sessions.path}
      text='Sessions'
    />
    <Tab
      path={paths.Admin.Tabs.Staff.path}
      text='Staff'
    />
    <Tab
      path={paths.Admin.Tabs.Students.path}
      text='Students'
    />
    <Tab
      path={paths.Admin.Tabs.Config.path}
      text='Config'
    />
  </Tabset>
)

interface Props {
  user: User
  breadcrumbs: JSX.Element
}

interface IOrgYearContext {
  orgYear: OrganizationYearView | undefined
  setOrgYear: (orgYear: OrganizationYearView) => void
}

export const OrgYearContext = createContext<IOrgYearContext>({
  orgYear: undefined,
  setOrgYear: (orgYear) => {}
})

export default ({ user, breadcrumbs}: Props) => {
  const navigate = useNavigate()
  const [orgYear, setOrgYear] = useState<OrganizationYearView>()
  const orgYearContextValue = { orgYear, setOrgYear }

  useEffect(() => {
    if (location.pathname === paths.Admin.path) {
      navigate(paths.Admin.Tabs.Sessions.path)
    }
  }, [location.pathname])

  return (
    <PageContainer className='rounded-top-left-0'>
      <OrgYearInput value={orgYear} onChange={setOrgYear} />
      <div className='w-100'>
        <TabSelector />
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

const OrgYearInput = ({value, onChange}): React.ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams(); //this is an argument in favor of moving the api call up a level. We deffo should..
  //an input component should be disconnected from the business logic of an api fetch anyhow.

  const { isPending, error, data: orgYears, refetch } = useQuery({
    queryKey: ['orgYears'],
    queryFn: () => api.get('https://localhost:44394/user/orgYear').then(res => res.data),
    select: (data: OrganizationYearDomain[]) => data.map(oy => OrganizationYear.toViewModel(oy))
  }, new QueryClient())



  function handleInputChange(
    orgYears: OrganizationYearView[] | undefined, 
    orgGuid: string | undefined, 
    yearGuid: string| undefined
  ): void {
    const selectedOrgYear: OrganizationYearView | undefined = getOrgYear(orgYears, orgGuid, yearGuid)
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
        : orgYears.find(x => x.year.isCurrentYear)

      handleOrgYearChange(defaultOrgYear)

      searchParams.delete('oyGuid')
      setSearchParams(searchParams)
    }
  }, [orgYears])

  if (isPending)
    return <span>Loading...</span>
  else if (error)
    return (
      <div>
        <div>An error occured while fetching organization years.</div>
        <button>Try again</button>
      </div>
    )

  const orgGuids: string[] = [...(new Set(orgYears.map(x => x.organization.guid)))]
  const orgs: any[] = orgGuids.map(guid => orgYears.find(oy => oy.organization.guid === guid)?.organization)
  const years: YearView[] = orgYears.filter(oy => oy.organization.guid === value?.organization.guid).map(oy => oy.year)

  return (
    <div className='row mb-3'>

      <div className='col-sm-4'>
        <label>Organization</label>
        <Select 
          value={{value: value?.organization.guid, label: value?.organization.name}}
          options={orgs.map(o => ({ value: o.guid, label: o.name }))}
          onChange={(option => handleInputChange(orgYears, option?.value, value?.year.guid))}
        />
      </div>

      <div className='col-sm-4'>
        <label>Term</label>
        <Select 
          value={{value: value?.year.guid, label: `${value?.year.schoolYear} - ${Quarter[value?.year.quarter]}`}}
          options={years.map(y => ({ value: y.guid, label: `${y.schoolYear} - ${Quarter[y.quarter]}`}))}
          onChange={(option => handleInputChange(orgYears, value?.organization.guid, option?.value))}
        />
      </div>

    </div>
  )
}