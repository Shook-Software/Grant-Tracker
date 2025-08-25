import { useState } from 'react'
import { Settings, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlackoutDateConfig } from './BlackoutDates'
import { StudentGroupsConfig } from './StudentGroups'

export default (): JSX.Element => {
	const [activeTab, setActiveTab] = useState<string>('blackout')

	return (
		<div className="mx-auto px-4 w-full pt-3">

			<div className='pt-1'>
				<div className='flex flex-nowrap -mx-2'>
					{/* Navigation Sidebar */}
					<div className={`px-2 flex-1 w-full`} style={{marginLeft: `-250px`, maxWidth: '250px'}}>
						<div className="border border-border rounded-lg p-1 bg-background">
							<nav className='flex flex-col space-y-1'>
								<Button
									variant={activeTab === 'blackout' ? 'default' : 'ghost'}
									className="justify-start gap-2 h-10"
									onClick={() => setActiveTab('blackout')}
								>
									<Calendar className="h-4 w-4" />
									Blackout Dates
								</Button>

								<Button
									variant={activeTab === 'student-groups' ? 'default' : 'ghost'}
									className="justify-start gap-2 h-10"
									onClick={() => setActiveTab('student-groups')}
								>
									<Users className="h-4 w-4" />
									Student Groups
								</Button>
							</nav>
						</div>
					</div>

					{/* Main Content */}
					<div className='flex-1 md:w-9/12'>
						{activeTab === 'blackout' && <BlackoutDateConfig />}
						{activeTab === 'student-groups' && <StudentGroupsConfig />}
					</div>
				</div>
			</div>
		</div>
	)
}