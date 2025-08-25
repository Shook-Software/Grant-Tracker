import { NavLink, Outlet } from 'react-router-dom'

import { PageContainer } from 'styles'

const Navbar = (): JSX.Element => (
  <nav className='flex border-b border-gray-200'>
    <NavLink 
      to='auth'
      className={({ isActive }) => `px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      User Authentication
    </NavLink>
    <NavLink 
      to='dropdowns'
      className={({ isActive }) => `px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      Dropdown Options
    </NavLink>
    <NavLink 
      to='controls'
      className={({ isActive }) => `px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      Site Controls
    </NavLink>
  </nav>
)

export default (): JSX.Element => {
  document.title = 'GT - Config'
  
  return (
    <PageContainer className='p-3'>
      <Navbar />
      <Outlet />
    </PageContainer>
  )
}

/*

      <Button
        onClick={() => {
          api.patch('config/students')
            .then(res => console.log(res))
            .catch(err => console.warn(err))
        }}
      >
        Sync Students with Synergy
      </Button>
      */
