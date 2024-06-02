import { DateOnly } from 'Models/DateOnly'
import { LocalDate } from '@js-joda/core'

export interface OrganizationBlackoutDateDomain {
	guid: string
	organizationGuid: string
	date: DateOnly
}

export interface OrganizationBlackoutDateView {
	guid: string
	organizationGuid: string
	date: LocalDate
}

export interface SessionBlackoutDateDomain {
	guid: string
	sessionGuid: string
	date: DateOnly
}

export interface SessionBlackoutDateView {
	guid: string
	sessionGuid: string
	date: LocalDate
}

export abstract class BlackoutDate {
	public static toViewModel(obj: OrganizationBlackoutDateDomain | SessionBlackoutDateDomain): OrganizationBlackoutDateView | SessionBlackoutDateDomain {
		if (!obj) return obj;

		return {
			...obj,
			date: DateOnly.toLocalDate(obj.date)
		}
	}
}