import { useRoutes, RouteObject, Link, Navigate } from 'react-router-dom'

import paths from './paths'
import HomePage from 'pages/Home'
import AdminPage from 'pages/Admin'

import Reporting from 'pages/Reporting'

import SessionEditor from 'pages/Editor'
import SessionOverview from 'pages/Editor/Session/Overview'
import SessionInvolved from 'pages/Editor/Session/Involved'
import SessionScheduling from 'pages/Editor/Session/Scheduling'
import SessionSubmit from 'pages/Editor/Session/Submit'

import AdminSessionsView from 'pages/Admin/Sessions'
import AdminStaffView from 'pages/Admin/Staff'
import AdminStudentView from 'pages/Admin/Students'

import Config from 'pages/Config'
import Authentication from 'pages/Config/Authentication'
import Dropdowns from 'pages/Config/Dropdowns'
import Controls from 'pages/Config/Controls'
import DeveloperLogs from 'pages/Config/Logs'

import Help from 'pages/Help'

import SessionDetails from 'components/SessionDetails'
import StudentDetails from 'components/StudentDetails'

import InstructorPage from 'components/Displays/Instructor'

import { User } from 'utils/authentication'


export const RenderRoutes = ({ routes, user, breadcrumbs }) => (
  useRoutes(routes(user, breadcrumbs))
)

const editSessionChildren = [
  {
    path: paths.Edit.Sessions.Overview.path,
    element: <SessionOverview />
  },
  {
    path: paths.Edit.Sessions.Involved.path,
    element: <SessionInvolved />
  },
  {
    path: paths.Edit.Sessions.Scheduling.path,
    element: <SessionScheduling />
  },
  {
    path: paths.Edit.Sessions.Submit.path,
    element: <SessionSubmit />
  }
]

export default (user: User, Breadcrumbs: JSX.Element): RouteObject[] => [
  {
    path: paths.Root.path,
    element: <Navigate to='/home' />
  },
  {
    path: paths.Home.path,
    element: <HomePage />
  },
  {
    path: paths.Reports.path,
    element: <Reporting />
  },
  {
    path: paths.Edit.path,
    children: [
      {
        path: paths.Edit.Sessions.path,
        element: 
        <div>
          {Breadcrumbs}
          <SessionEditor user={user} />
        </div>,
        children: editSessionChildren
      },
      {
        path: paths.Edit.Sessions.path + '/:sessionGuid',
        element: <SessionEditor user={user} />,
        children: editSessionChildren
      }
    ]
  },
  {
    path: paths.Admin.path,
    element: 
    <>
      <AdminPage user={user} breadcrumbs={Breadcrumbs} />
    </>,
    children: [
      //Overview tab when ready for it, show site aggregates and information.
      {
        path: paths.Admin.Tabs.Sessions.path,
        children: [
          {
            index: true,
            element: <AdminSessionsView />
          },
          {
            path: '/home/admin/sessions/:sessionGuid',
            element: <SessionDetails />
          }
        ]
      },
      {
        path: paths.Admin.Tabs.Staff.path,
        children: [
          {
            index: true,
            element: <AdminStaffView />
          },
          {
            path: '/home/admin/staff/:instructorSchoolYearGuid',
            element: <InstructorPage />
          }
        ]
      },
      {
        path: paths.Admin.Tabs.Students.path,
        children: [
          {
            index: true,
            element: <AdminStudentView />
          },
          {
            path: '/home/admin/students/:studentGuid',
            element: <StudentDetails />
          }
        ]
      }
    ]
  },
  {
    path: paths.Configuration.path,
    element: <Config />,
    children: [
      {
        path: '/home/config/auth',
        element: <Authentication />
      },
      {
        path: '/home/config/dropdowns',
        element: <Dropdowns />
      },
      {
        path: '/home/config/controls',
        element: <Controls />
      },
      {
        path: '/home/config/dev/logs',
        element: <DeveloperLogs />
      }
    ]
  },
  {
    path: paths.Help.path,
    element: <Help />
  }
]
