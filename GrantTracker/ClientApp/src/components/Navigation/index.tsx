import React, { ReactNode, useState, useEffect } from 'react'
import { NavLinkProps } from 'react-router-dom'
import SelectSearch from 'components/Input/SelectSearch'

import { User, IdentityClaim } from 'utils/authentication'
import { Container, Nav, Link as NavLink } from './styles'

import { OrganizationView, OrganizationYearView, Quarter } from 'models/OrganizationYear'

import { AxiosIdentityConfig } from 'utils/api'


interface NavigationProps {
  user: User
  orgYearChange: () => void
  children: ReactNode
}

const RenderLinks = (props: {user: User, children: ReactNode}): JSX.Element => {
  return (
    <>
      <ul className='d-flex' data-testid='nav-list'>
        {React.Children.toArray(props.children).map((child, index) => {
          return (
            <li key={`nav-item-${index}`}>
              {child}
            </li>
          )
        })}
      </ul>
      <div>Authenticated as {`${props.user.firstName} ${props.user.lastName}`}</div>
    </>
  )
}

const OrganizationYearSelect = ({user, onChange}: {user: User, onChange}) => {
  const [organizations, setOrganizations] = useState<OrganizationView[]>([])
  const [years, setYears] = useState<OrganizationYearView[]>([])

  //handle organization and year selection
  const orgOptions = organizations.map(org => (
    {
      name: org.name,
      value: org.guid
    }
  ))

  const yearOptions = years.map(oy => (
    {
      name: `${oy.year.schoolYear} - ${Quarter[oy.year.quarter]}`,
      value: oy.guid
    }
  ))

  const orgDropdownDisabled: boolean = (!orgOptions || orgOptions.length === 0 || orgOptions.length === 1)
  const currentOrganization: any = orgOptions.find(org => org.value == user.organization.guid)
  const currentYear: any = yearOptions.find(year => year.value == user.organizationYearGuid)

  const handleOrganizationChange = (guid: string): void => {
    const organization: OrganizationView | undefined = organizations.find(org => org.guid === guid)
    let organizationYearGuid: string | undefined
    user
      .getOrganizationYearsAsync(guid)
      .then(res => {
        organizationYearGuid = res.find(orgYear => orgYear.organization.guid == guid)?.guid
        const currentYear: OrganizationYearView | undefined = res.find(oy => oy.year.isCurrentYear === true)
        user.setOrganization(organization)
        user.setYear(currentYear)
        user.setOrganizationYear(organizationYearGuid)
    
        onChange()
      })
  }

  const handleYearChange = (guid: string): void => {
    const year: OrganizationYearView | undefined = years.find(year => year.guid === guid)
    //console.log(years, guid)
    user.setYear(year)
    user.setOrganizationYear(guid)

    onChange()
  }

  useEffect(() => {
    user
      .getAuthorizedOrganizationsAsync()
      .then(res => {
        setOrganizations(res)  
      })
  }, [])

  useEffect(() => {
    user
      .getOrganizationYearsAsync(user.organization.guid)
      .then(res => {
        setYears(res)
      })
  }, [user])

  useEffect(() => {
    if (organizations.length > 0 && years.length > 0)
    {
      const lastOrganizationGuid = localStorage.getItem(`organizationGuid-${user.userGuid}`)
      const lastYearGuid = localStorage.getItem(`yearGuid-${user.userGuid}`)
      if (lastOrganizationGuid && lastOrganizationGuid != user.organization.guid)
      {
        const organization: OrganizationView | undefined = organizations.find(org => org.guid === lastOrganizationGuid)  
        user
          .getOrganizationYearsAsync(lastOrganizationGuid)
          .then(res => {
            //console.log(res)
            let organizationYearGuid = res.find(orgYear => orgYear.organization.guid == lastOrganizationGuid)?.guid 
            user.setOrganization(organization)
            //user.setYear(res[0])
            user.setOrganizationYear(organizationYearGuid)
        
            //console.log(lastYearGuid, user.year.guid)
            if (lastYearGuid)
            {
              const year: OrganizationYearView | undefined = res.find(sy => sy.year.guid === lastYearGuid)
              user.setYear(year)
            }

            onChange()
          })
      }
      /*if (lastYearGuid && lastYearGuid != user.year.guid)
      {
        handleYearChange(lastYearGuid)
      }*/
    }
    
  }, [AxiosIdentityConfig.identity.organizationGuid, organizations, years])

  return (
    <div className='position-absolute text-white' style={{zIndex: 500, right: '2rem', top: 0}}>
      {
        currentOrganization && currentYear
        ? 
          <div className='d-flex mb-3 mt-2'>
            <div>
              <label htmlFor='organization' className='small'>Organization</label>
              <SelectSearch 
                id='organization'
                disabled={orgDropdownDisabled}
                options={orgOptions} 
                value={user.organization.guid} 
                handleChange={value => handleOrganizationChange(value)}
              />
            </div>
            <div style={{width: '1rem'}} />
            <div>
              <label htmlFor='year' className='small'>Term for {currentOrganization.name}</label>
              <SelectSearch 
                id='year'
                options={yearOptions} 
                value={user.organizationYear.guid} 
                handleChange={value => handleYearChange(value)}
              />
            </div>
          </div>
        : null
      }
      </div>
  )
}

export const Navigation = (props: NavigationProps): JSX.Element => {

  //handle the display of navigation links
  const filteredLinks = React.Children.toArray(props.children).filter((child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      if (child.props.requiredType !== undefined && !props.user.isAuthorized(child.props.requiredType)) {
        return false
      }
      return true
    }
  })

  return (
    <Container className='d-flex justify-content-between position-fixed' style={{zIndex: 1030}}>
      <Nav linkCount={filteredLinks.length}>
        <RenderLinks user={props.user} children={filteredLinks} />
      </Nav>
      <OrganizationYearSelect user={props.user} onChange={props.orgYearChange} />
    </Container>
  )
}


export const Link = (props: NavLinkProps): JSX.Element => (
  <NavLink
    requiredtype={IdentityClaim.Coordinator}
    {...props}
  >
    {props.children}
  </NavLink>
)

interface ProtectedLinkProps extends NavLinkProps {
  requiredType?: IdentityClaim
}

export const ProtectedLink = ({ to, requiredType, ...props }: ProtectedLinkProps): JSX.Element => (
  <NavLink
    to={to}
    requiredtype={requiredType}
    {...props}
  >
    {props.children}
  </NavLink>
)
