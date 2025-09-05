import { useContext, useEffect, useState } from "react"
import { LocalDate } from "@js-joda/core"

import { Form, FormItem, FormControl, FormLabel, FormField } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'

import { OrganizationYearView, Quarter, YearView } from "Models/OrganizationYear"

import { IdentityClaim } from "utils/authentication"
import { AppContext } from "App"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

export interface ReportParameters {
	organizationGuid: string | undefined
	organizationName: string | undefined
	year: YearView | undefined
	startDate: LocalDate | undefined
	endDate: LocalDate | undefined
}

function nextMonday(date: LocalDate) {
	return date.plusDays((7 - date.dayOfWeek().ordinal()) || 7)
}

function previousMonday(date: LocalDate) {
	return date.plusDays((-date.dayOfWeek().ordinal()) || -7)
}

export default ({onSubmit}): JSX.Element => {
	const { user } = useContext(AppContext)

	const [orgGuid, setOrgGuid] = useState<string>(user.organization.guid)
	const [yearGuid, setYearGuid] = useState<string>(user.year.guid)

	const [startDate, setStartDate] = useState<LocalDate | undefined>()
	const [endDate, setEndDate] = useState<LocalDate | undefined>()

	const form = useForm();

	const [isSingleDateQuery, setIsSingleDateQuery] = useState<boolean>(false)
	const [hasAutoSubmitted, setHasAutoSubmitted] = useState<boolean>(false)

	function setYear(yearGuid: string) {
		const orgYear: OrganizationYearView | undefined = user.organizationYears.find(oy => oy.organization.guid == user.organization.guid && oy.year.guid == yearGuid)
		user.setOrganizationYear(orgYear)
		setYearGuid(yearGuid)
	}

	function setOrganization(orgGuid: string) {
		const orgYear: OrganizationYearView | undefined = user.organizationYears.find(oy => oy.organization.guid == orgGuid && oy.year.guid == user.year.guid)
		user.setOrganizationYear(orgYear)
		setOrgGuid(orgGuid)
	}

	function submit(): void {
		if ((orgGuid || orgGuid === '') && user.year && startDate && endDate)
			onSubmit({
				organizationGuid: orgGuid,
				organizationName: user.organizations?.find(x => x.guid == orgGuid)?.name || 'All Organizations',
				year: user.year,
				startDate,
				endDate: isSingleDateQuery ? startDate : endDate
			});
	}

	useEffect(() => {
		if (!user.year)
			return;

		setStartDate(user.year.startDate)
		setEndDate(user.year.endDate)
	}, [user.year?.guid])

	// Auto-submit when all required fields are defined for the first time
	useEffect(() => {
		if (!hasAutoSubmitted && orgGuid && startDate && endDate) {
			setHasAutoSubmitted(true)
			submit()
		}
	}, [orgGuid, startDate, endDate, hasAutoSubmitted])

	const orgOptions = user.claim == IdentityClaim.Administrator 
		? [{ value: '', label: 'All' }, ...user.organizations.map(org => ({ value: org.guid, label: org.name }))]
		: user.organizations.map(org => ({ value: org.guid, label: org.name }))

	user.years
		.sort((curr, next) => {
			if (curr.schoolYear == next.schoolYear)
				return curr.quarter > next.quarter ? -1 : 1
			
			return curr.schoolYear > next.schoolYear ? -1 : 1
		})

	return (
		<div className='container'>
			<Form {...form}>
				<form onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
					<div className='flex gap-3'>
						<div className="flex flex-col gap-3">
							<FormField 
								control={form.control}
								name="Organization"
								render={() => 
									<FormItem>
										<FormLabel htmlFor='org'>Organization</FormLabel>
										<Combobox 
											id='org'
											options={orgOptions}
											value={orgGuid}
											onChange={value => setOrganization(value)}
											placeholder="Select Organization"
										/>
									</FormItem>
								}
							/>

							<div className={isSingleDateQuery ? 'flex items-center justify-around px-0' : 'hidden'}>
								<Button type='button' size='sm' className='flex' onClick={() => setStartDate(previousMonday(startDate))}>&#11164;&#11164;</Button>
								<Button type='button' size='sm' className='flex' onClick={() => setStartDate(startDate?.plusDays(-1))}>&#11164;</Button>
							</div>
							
							<div className="">
								<FormField 
									control={form.control}
									name="Start Date"
									render={() =>
										<FormItem>
											<FormLabel htmlFor='start-date'>{isSingleDateQuery ? 'Date' : 'Start Date'}</FormLabel>
											<FormControl>
												<Input 
													type='date' 
													id='start-date' 
													value={startDate?.toString()}
													onChange={(e) => setStartDate(LocalDate.parse(e.target.value))}
												/>
											</FormControl>
										</FormItem>
									}
								/>
							</div>

							<div className={isSingleDateQuery ? 'flex items-center justify-around px-0' : 'hidden'}>
								<Button type='button' size='sm' className='flex' onClick={() => setStartDate(startDate?.plusDays(1))}>&#11166;</Button>
								<Button type='button' size='sm' className='flex' onClick={() => setStartDate(nextMonday(startDate))}>&#11166;&#11166;</Button>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<FormField
								control={form.control}
								name="School Year"
								render={() => 
									<FormItem>
										<FormLabel htmlFor='school-year'>School Year <small>(Affects Staffing Only)</small></FormLabel> 
										<Combobox
											id='school-year'
											options={user.years
												.map(year => ({
													value: year.guid,
													label: `${year.schoolYear} - ${Quarter[year.quarter]}`
												}))}
											value={user.year.guid}
											onChange={yearGuid =>  setYear(yearGuid)}
											placeholder="Select School Year"
										/>
									</FormItem>
								}
							/>

							<div className={isSingleDateQuery ? 'hidden' : ''}>
								<FormField
									control={form.control}
									name="End Date"
									render={() => 
										<FormItem>
											<FormLabel htmlFor='end-date'>End Date</FormLabel>
											<FormControl>
												<Input
													type='date'
													id='end-date' 
													className='flex'
													value={endDate?.toString()}
													onChange={(e) => setEndDate(LocalDate.parse(e.target.value))}
												/>
											</FormControl>
										</FormItem>
									}
								/>
							</div>
						</div>

						<div className="flex items-end">
							<Button type='submit'>
								Submit
							</Button>
						</div>
					</div>

					<div className="mb-3">
						<FormField 
							control={form.control}
							name="Date"
							render={() =>
								<FormItem className="flex flex-row items-center gap-2 mt-3">
									<FormControl>
										<Checkbox
											id='single-date-checkbox'
											checked={isSingleDateQuery}
											onCheckedChange={(checked) => setIsSingleDateQuery(checked)}
										/>
									</FormControl>
									<FormLabel htmlFor='single-date-checkbox'>Query single date</FormLabel>
								</FormItem>
							}
						/>
					</div>
				</form>
			</Form>
		</div>
	)
}