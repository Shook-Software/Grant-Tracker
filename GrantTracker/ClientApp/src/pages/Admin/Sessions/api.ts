import { Session, SessionForm, SessionDomain } from 'Models/Session'
import { DropdownOption } from 'types/Session'

import api from 'utils/api'

export interface DropdownOptions {
	sessionTypes: DropdownOption[]
	activities: DropdownOption[]
	objectives: DropdownOption[]
	instructors: DropdownOption[]
	instructorStatuses: DropdownOption[]
	fundingSources: DropdownOption[]
	organizationTypes: DropdownOption[]
	partnershipTypes: DropdownOption[]
	grades: DropdownOption[]
}

export function fetchGradeOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
	api.get<DropdownOption[]>('dropdown/view/grades')
		.then(res => { resolve(res.data) })
		.catch(err => {
			console.warn(err)
			reject([])
		})
  })
}

export function fetchAllDropdownOptions(): Promise<DropdownOptions> {
	return new Promise((resolve, reject) => {
		api.get('dropdown/view/all')
			.then(res => resolve({ ...res.data, instructors: [] }))
			.catch(exception => {
				reject(exception)
			})
	})
}

export function fetchSession(sessionGuid: string): Promise<SessionForm> {
	return new Promise((resolve, reject) => {
		api
			.get<SessionDomain>(`session/${sessionGuid}`)
			.then(res => {
				const session: SessionForm = Session.toFormModel(res.data)
				resolve(session)
			})
			.catch(err => console.warn(err))
	})
}

export function submitSession(sessionState: SessionForm): Promise<string> {
	return new Promise((resolve, reject) => {

		sessionState.instructors = sessionState.instructors?.map(instructor => instructor.guid)

		if (sessionState.guid) {
			api
				.patch('session', sessionState)
				.then(res => {
					resolve(res.data.guid)
				})
				.catch(err => { reject(err) })
		}
		else {

			delete sessionState.guid

			api
				.post('session', {
					...sessionState,
				})
				.then(res => { resolve(res.data.guid) })
				.catch(err => { reject(err) })

		}
	})
}
