import { LocalDate } from '@js-joda/core'
import { DateOnly } from './DateOnly'
import { Year, YearDomain, YearView } from './OrganizationYear'

export interface PayPeriodDto 
{
	period: number
	startDate: DateOnly
	endDate: DateOnly
}

export interface PayrollYearDto
{
	guid: string
	name: string
	periods: PayPeriodDto[]
	years: YearDomain[]
}

export interface PayPeriod 
{
	period: number
	startDate: LocalDate
	endDate: LocalDate
}

export interface PayrollYear
{
	guid: string
	name: string
	periods: PayPeriod[]
	years: YearView[]
}

export abstract class PayrollYear {
	public static toViewModel(obj: PayrollYearDto): PayrollYear {
	  return {
		...obj,
		periods: obj.periods.map(p => ({
			...p,
			startDate: DateOnly.toLocalDate(p.startDate),
			endDate: DateOnly.toLocalDate(p.endDate)
		})),
		years: obj.years.map(y => Year.toViewModel(y))
	  }
	}
}

