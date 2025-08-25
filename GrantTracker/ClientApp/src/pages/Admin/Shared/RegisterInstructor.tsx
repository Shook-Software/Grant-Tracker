import { useState } from 'react'
import { InstructorSchoolYearView } from 'Models/Instructor'
import { SimpleSessionView } from 'Models/Session'
import api from 'utils/api'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import { Label } from '@/components/ui/label'

interface Input {
	sessions: SimpleSessionView[],
	instructors: InstructorSchoolYearView[]
}

export default ({sessions, instructors}: Input): JSX.Element => {
	const [selectedSessions, setSelectedSessions] = useState<Option[]>([])
	const [instructorSYGuid, setInstructorSYGuid] = useState<string | undefined>(undefined)

	const [loading, setLoading] = useState<boolean>(false)
	const [successes, setSuccesses] = useState<string[]>([])
	const [errors, setErrors] = useState<string[]>([])

	function inputIsValid(): boolean {
		return selectedSessions.length > 0 && !!instructorSYGuid;
	}

	function submit(e) {
		e.preventDefault()

		if (!inputIsValid())
			return;

		let successList: string[] = []
		let errorList: string[] = []

		setLoading(true)
		setErrors([])
		setSuccesses([])

		Promise.all(selectedSessions.map(session => api.post(`session/${session.value}/instructor/registration?instructorSchoolYearGuid=${instructorSYGuid}`)
			.then(_ =>  successList.push(`Successfully added to ${session.label}!`))
			.catch(err => errorList.push(`Failed to add to ${session.label}`))))
			.finally(() => {
				setLoading(false)
				setErrors(errorList)
				setSuccesses(successList)
		})
	}

	return (
		<div className='space-y-4'>
			<form className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end' aria-label='Add instructor to sessions' onSubmit={submit}>
				<div className='md:col-span-4 space-y-2'>
					<Label htmlFor='instructor-select'>Select Instructor</Label>
					<Combobox
						id='instructor-select'
						options={instructors.map(isy => ({
							value: isy.guid,
							label: `${isy.instructor.firstName} ${isy.instructor.lastName}`
						}))}
						value={instructorSYGuid || ''}
						onChange={setInstructorSYGuid}
						placeholder='Search instructors...'
						emptyText='No instructors found'
					/>
				</div>

				<div className='md:col-span-4 space-y-2'>
					<Label htmlFor='sessions-selector'>Select Sessions</Label>
					<MultipleSelector
						options={sessions.map(s => ({ value: s.sessionGuid, label: s.name }))}
						value={selectedSessions}
						onChange={setSelectedSessions}
						placeholder='Search and select sessions...'
						emptyIndicator='No sessions found'
					/>
				</div>

				<div className='md:col-span-4'>
					<Button type='submit' disabled={loading || !inputIsValid()} className='w-full md:w-auto'>
						{loading ? (
							<div className='flex items-center gap-2'>
								<Spinner size='sm' />
								Submitting...
							</div>
						) : (
							'Submit'
						)}
					</Button>
				</div>
			</form>
			
			{successes.length > 0 && (
				<div className='space-y-1'>
					{successes.map((success, index) => (
						<div key={index} className='text-green-600 text-sm'>{success}</div>
					))}
				</div>
			)}
			
			{errors.length > 0 && (
				<div className='space-y-1'>
					{errors.map((error, index) => (
						<div key={index} className='text-red-600 text-sm'>{error}</div>
					))}
				</div>
			)}
		</div>
	)
}