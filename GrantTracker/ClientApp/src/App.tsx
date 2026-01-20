import { createContext, useEffect, useState } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'

import MainNavigation from 'components/MainNavigation'
import { PayrollYear } from 'Models/PayPeriod'

import paths from 'utils/routing/paths'
import appRoutes, { RenderRoutes } from 'utils/routing'
import { IdentityClaim, User as User } from 'utils/authentication'
import api from 'utils/api'
import { OrganizationYear, OrganizationYearDomain } from 'Models/OrganizationYear'
import 'app.scss'
import 'output.css'


export const App = (): JSX.Element => {
  const [user, setUser] = useState<User | null>(null)

  const { data: payrollYears, refetch: refetchPayrollYears } = useQuery({
    queryKey: ['payrollYear'],
    queryFn: () => api.get('dropdown/payrollYear').then(res => res.data.map(py => PayrollYear.toViewModel(py)))
  }, new QueryClient())

  const { isPending: userPending, data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('user').then(res => res.data),
    retry: 3,
    retryDelay: (attempt) => attempt * 500
  }, new QueryClient())

  const { isPending: orgYearsPending, data: orgYears } = useQuery({
    queryKey: ['orgYears'],
    queryFn: () => api.get('user/orgYear').then(res => res.data),
    select: (data: OrganizationYearDomain[]) => data.map(oy => OrganizationYear.toViewModel(oy)),
    enabled: !!userData && userData.claim !== IdentityClaim.Unauthenticated,
    retry: 3,
    retryDelay: (attempt) => attempt * 500
  }, new QueryClient())

  useEffect(() => {
    if (userData && orgYears && !user) {
      const newUser = new User(userData)
      newUser.setOrganizationYear(OrganizationYear.toViewModel(userData.organizationYear))
      newUser.setOrganizationYears(orgYears)
      setUser(newUser)
    }
  }, [userData, orgYears])

  const appContextValue = { user: user || new User(null), setUser, refetchPayrollYears, data: { payrollYears} };

  if (userPending || orgYearsPending)
      return <p>...Loading user information.</p>

  if (!user || user.claim == IdentityClaim.Unauthenticated || !user.organizationYears || user.organizationYears.length == 0)
    return (
      <div> Please allow the page a moment to load.
        You may be unauthenticated, refresh the page or fill out an <a href='https://forms.office.com/r/0Hq5fsxHze'>issue report</a> with your badge number and organization if the issue persists.
      </div>
    )

  return (
    <div className=''>
      <MainNavigation
        key={user.badgeNumber}
        paths={paths}
        user={user}
      />
      <div
        className='mx-auto px-4 max-w-7xl flex flex-col items-center w-full mx-5'
        style={{ paddingTop: '2rem', minWidth: '95vw' }}
      >
        <AppContext.Provider value={appContextValue}>
          <RenderRoutes
            routes={appRoutes}
            user={user}
          />
        </AppContext.Provider>
      </div>
    </div>
  )
}

interface AppContext {
  user: User,
  setUser: (user: User | null) => void,
  refetchPayrollYears: () => undefined,
  data: {
    payrollYears: PayrollYear[]
  }
}

export const AppContext = createContext<AppContext>({
  user: new User(null),
  setUser: () => {},
  refetchPayrollYears: () => undefined,
  data: {
    payrollYears: []
  }
})