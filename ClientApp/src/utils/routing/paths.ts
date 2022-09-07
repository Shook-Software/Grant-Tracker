export default {
  Root: {
    path: '/'
  },
  Home: {
    path: '/home'
  },
  Reports: {
    path: '/home/reporting',
    Sessions: {
      path: 'session',
    }
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
      Sessions: { path: 'sessions' },
      Staff: { path: 'staff' },
      Students: { path: 'students' },
    },
    Viewer: {
      Session: { path: 'session' },
      Instructor: { path: 'instructor' },
      Student: { path: 'student' }
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
