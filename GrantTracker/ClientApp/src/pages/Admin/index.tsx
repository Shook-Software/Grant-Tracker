import { useEffect } from 'react'
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom'

import { Tabset, Tab } from 'components/Tabset'
import { PageContainer } from 'styles'

import { User } from 'utils/authentication'
import paths from 'utils/routing/paths'

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

export default ({ user, breadcrumbs}: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === paths.Admin.path) {
      navigate(paths.Admin.Tabs.Sessions.path)
    }
  }, [location.pathname])

  return (
    <PageContainer className='rounded-top-left-0'>
      {breadcrumbs}
      <div className='w-100'>
        <TabSelector />
      </div>
        <Outlet
          context={{
            user
          }}
        />
    </PageContainer>
  )
}

export type Context = {
  user: User
}

export function useAdminPage(): Context {
  return useOutletContext<Context>()
}
