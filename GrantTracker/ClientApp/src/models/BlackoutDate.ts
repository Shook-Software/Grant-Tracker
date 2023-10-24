import { DateOnly } from 'Models/DateOnly'
import { LocalDate } from '@js-joda/core'

export interface BlackoutDateDomain {
	guid: string
	organizationGuid: string
	date: DateOnly
}

export interface BlackoutDateView {
	guid: string
	organizationGuid: string
	date: LocalDate
}

export abstract class BlackoutDate {
	public static toViewModel(obj: BlackoutDateDomain): BlackoutDateView {
		if (!obj) return obj;

		return {
			...obj,
			date: DateOnly.toLocalDate(obj.date)
		}
	}
}