import { useState } from 'react'
import { InstructorSchoolYearView } from 'Models/Instructor'
import { SimpleSessionView } from 'Models/Session'
import api from 'utils/api'
import Dropdown from 'components/Input/Dropdown'
import { Spinner } from 'react-bootstrap'

interface Input {
	sessions: SimpleSessionView[],
	instructors: InstructorSchoolYearView[]
}

export default ({sessions, instructors}: Input): JSX.Element => {
	const [sessionGuids, setSessionGuids] = useState<string[]>([])
	const [instructorSYGuid, setInstructorSYGuid] = useState<string | undefined>(undefined)

	const [loading, setLoading] = useState<boolean>(false)
	const [successes, setSuccesses] = useState<string[]>([])
	const [errors, setErrors] = useState<string[]>([])

	function inputIsValid(): boolean {
		return sessionGuids.length > 0 && !!instructorSYGuid;
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

		Promise.all(sessionGuids.map(sGuid => api.post(`session/${sGuid}/instructor/registration?instructorSchoolYearGuid=${instructorSYGuid}`)
			.then(_ =>  successList.push(`Successfully added to ${sessions.find(s => s.sessionGuid == sGuid)!.name}!`))
			.catch(err => errorList.push(`Failed to add to ${sessions.find(s => s.sessionGuid == sGuid)!.name}`))))
			.finally(() => {
				setLoading(false)
				setErrors(errorList)
				setSuccesses(successList)
		})
	}

	return (
		<div>
			<form className='row' aria-label='Add instructor to sessions' onSubmit={submit}>
				<div className='col-4'>
					<select className='form-select' aria-label='Select an instructor' value={instructorSYGuid} onChange={(e) => setInstructorSYGuid(e.target.value)}>
						<option value={undefined}></option>
						{instructors.map(isy => <option value={isy.guid}>{isy.instructor.firstName} {isy.instructor.lastName}</option>)}
					</select>
				</div>

				<div className='col-4'>
					<Dropdown
						value={sessionGuids}
						options={sessions.map(s => ({ guid: s.sessionGuid, label: s.name }))}
						onChange={(value: string[]) => setSessionGuids(value)}
						multipleSelect
					/>
				</div>

				<div className='col-2'>
					<button className='btn btn-primary' type='submit' disabled={loading || !inputIsValid()}>{loading ? <Spinner /> : 'Submit'}</button>
				</div>
			</form>
			<div>
				{successes.map(success => <div className='text-success'><small>{success}</small></div>)}
			</div>
			<div>
				{errors.map(error => <div className='text-danger'><small>{error}</small></div>)}
			</div>
		</div>
	)
}