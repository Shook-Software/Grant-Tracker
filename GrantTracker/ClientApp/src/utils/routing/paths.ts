export default {
  Root: {
    path: '/'
  },
  Home: {
    path: '/home'
  },
  Reports: {
    path: '/home/reporting'
  },
  Edit: {
    path: '/home/edit',
    Sessions: {
      path: 'session',
      Overview: { path: 'overview' },
      Involved: { path: 'involved' },
      Scheduling: { path: 'scheduling' },
      Submit: { path: 'submit' }
    }
  },
  Admin: {
    path: '/home/admin',
    Tabs: {
      Overview: { path: 'overview' },
      Sessions: { path: 'sessions' },
      Staff: { path: 'staff' },
      Students: { path: 'students' },
      Config: { path: 'config' }
    },
    Viewer: {
      Session: { path: 'session' },
      Instructor: { path: 'instructor' },
      Student: { path: 'student' }
    },
    Attendance: {
      path: '/home/admin/attendance'
    }
  },
  Configuration: {
    path: '/home/config'
  },
  Survey: {
    path: '/home/survey'
  },
  Help: {
    path: '/home/help'
  }
}

//rewrite this to be useful for gettings routes, not setting up the routes themselves
