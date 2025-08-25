import { useState } from 'react'

import Years from './Years'
import Payroll from './Payroll'
import Organizations from './Organizations'
import Instructors from './Instructors'

type TabKey = 'year' | 'org' | 'payroll' | 'instructor'

interface TabConfig {
  key: TabKey
  label: string
  component: React.ComponentType
}

const tabs: TabConfig[] = [
  { key: 'year', label: 'School Years', component: Years },
  { key: 'org', label: 'Organizations', component: Organizations },
  { key: 'payroll', label: 'Payroll Years', component: Payroll },
  { key: 'instructor', label: 'Instructor Management', component: Instructors },
]

export default (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabKey>('year')
  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || Years

  return (
    <div className='flex gap-6 p-3'>
      <div className='w-48 flex-shrink-0'>
        <nav className='flex flex-col space-y-1'>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors select-none ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className='flex-1 min-w-0'>
        <ActiveComponent />
      </div>
    </div>
  )
}

//create modal

//School years
//display existing years, maybe some statistics if I feel fancy and am ahead of time
//main focus: Be able to create new years