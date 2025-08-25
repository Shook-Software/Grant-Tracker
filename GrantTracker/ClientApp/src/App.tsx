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
  const [user, setUser] = useState<User>(new User(null)) //move into appcontext
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { data: payrollYears, refetch: refetchPayrollYears } = useQuery({
    queryKey: ['payrollYear'],
    queryFn: () => api.get('dropdown/payrollYear').then(res => res.data.map(py => PayrollYear.toViewModel(py)))
  }, new QueryClient())

  const { isPending: orgYearsPending, error, data: orgYears } = useQuery({
    queryKey: ['orgYears'],
    queryFn: () => api.get('user/orgYear').then(res => res.data),
    select: (data: OrganizationYearDomain[]) => data.map(oy => OrganizationYear.toViewModel(oy)),
    enabled: user.isAuthenticated(),
    retry: 3,
    retryDelay: (attempt) => attempt * 500
  }, new QueryClient())

  const appContextValue = { user, refetchPayrollYears, data: { payrollYears} };

  useEffect(() => {
    setIsLoading(true)

    User
      .initUserAsync()
      .then(res => {
        setUser(res)
      })
      .finally(() => { setIsLoading(false)})
  }, [])

  useEffect(() => {
    if (!!orgYears) {
      user.setOrganizationYears(orgYears)
      setIsLoading(false)
    }
    
  }, [orgYears?.length])



  if (!isLoading && (!user || user.claim == IdentityClaim.Unauthenticated))
    return (
      <div> Please allow the page a moment to load. 
        You may be unauthenticated, refresh the page or fill out an <a href='https://forms.office.com/r/0Hq5fsxHze'>issue report</a> with your badge number and organization if the issue persists.
      </div>
    )
  else if (isLoading || orgYearsPending)
      return <p>...Loading user information.</p>

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
  refetchPayrollYears: () => undefined,
  data: {
    payrollYears: PayrollYear[]
  }
}

export const AppContext = createContext<AppContext>({
  user: new User(null),
  refetchPayrollYears: () => undefined,
  data: {
    payrollYears: []
  }
})