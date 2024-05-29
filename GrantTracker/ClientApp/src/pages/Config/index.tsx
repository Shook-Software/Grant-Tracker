import { NavLink, Outlet } from 'react-router-dom'
import { Nav } from 'react-bootstrap'

import { PageContainer } from 'styles'

const Navbar = (): JSX.Element => (
  <Nav variant='tabs' defaultActiveKey='/home/config/auth'>
    <Nav.Item>
      <Nav.Link as={NavLink} to='auth'>
        User Authentication
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={NavLink} to='dropdowns'>
        Dropdown Options
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={NavLink} to='controls'>
        Site Controls
      </Nav.Link>
    </Nav.Item>
  </Nav>
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
