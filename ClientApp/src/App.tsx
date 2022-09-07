import { useEffect, useState } from 'react'
import { useLocation, Location } from 'react-router-dom'
import { Container } from 'react-bootstrap'

import Breadcrumb from 'components/Breadcrumb'
import MainNavigation from 'components/MainNavigation'

import { OrganizationView, YearView } from 'models/OrganizationYear'

import appRoutes, { RenderRoutes } from 'utils/routing'
import { IdentityClaim, User as User } from 'utils/authentication'
import paths from 'utils/routing/paths'
import api from 'utils/api'


export const App = (): JSX.Element => {
  const [user, setUser] = useState<User>(new User(null))
  const [organizations, setOrganizations] = useState<OrganizationView[]>([])
  const [years, setYears] = useState<YearView[]>([]) 
  const location: Location = useLocation()

  const breadcrumbItems: string[] = location.pathname
    .split('/')
    .filter(item => item && item.length < 15)
    .map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`)

  //this could all be cleaned up.
  const handleOrgYearChange = () => {
    //reassign user on change to redisplay page
    setUser(Object.assign(Object.create(Object.getPrototypeOf(user)), user))
  }

  useEffect(() => {
    User
      .initUserAsync()
      .then(res => {
        setUser(res)
      })
  }, [])

  if (!user || user.claim == IdentityClaim.Unauthenticated)
    return (
      <div>
        You are unauthenticated, refresh the page and contact
        ethan.shook@tusd1.org if the issue persists.
      </div>
    )

  return (
    <div className=''>
      <MainNavigation
        key={user.badgeNumber}
        paths={paths}
        user={user}
        orgYearOptions={{organizations, years}}
        orgYearChange={(organizationGuid, yearGuid) => handleOrgYearChange(organizationGuid, yearGuid)}
      />
      <Container
        className='d-flex flex-column align-items-start'
        style={{ width: 'min-content', paddingTop: '6.5rem' }}
      >
        <Breadcrumb
          items={breadcrumbItems}
          activeItem={breadcrumbItems[breadcrumbItems.length - 1]}
        />
        <RenderRoutes routes={appRoutes} user={user} />
      </Container>
    </div>
  )
}
