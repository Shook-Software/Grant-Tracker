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
	organizationGuids: string[]
	organizationName: string  // Single display name: org name or "Multiple Orgs"
	organizationNames: string[]
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

	const [orgGuids, setOrgGuids] = useState<string[]>([user.organization.guid])
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

	function setOrganizations(selectedValue: string | string[]) {
		const selectedGuids = Array.isArray(selectedValue) ? selectedValue : [selectedValue]

		// Handle "All" exclusivity - if "All" (empty string) is newly selected, deselect everything else
		// If something else is selected while "All" is selected, deselect "All"
		let finalGuids = selectedGuids
		const allWasSelected = orgGuids.includes('')
		const allIsNowSelected = selectedGuids.includes('')

		if (allIsNowSelected && !allWasSelected) {
			// "All" was just selected - keep only "All"
			finalGuids = ['']
		} else if (allIsNowSelected && allWasSelected && selectedGuids.length > 1) {
			// "All" was already selected and another option was added - remove "All"
			finalGuids = selectedGuids.filter(g => g !== '')
		}

		setOrgGuids(finalGuids)
		// Note: We intentionally don't update user.setOrganizationYear() here
		// Reports org selection is local and doesn't affect other pages
	}

	function submit(): void {
		if (orgGuids.length > 0 && user.year && startDate && endDate) {
			// Get organization names for the selected guids
			const orgNames = orgGuids.map(guid =>
				guid === '' ? 'All Organizations' : user.organizations?.find(x => x.guid == guid)?.name || 'Unknown'
			)

			// Determine display name: single org name, "All Organizations", or "Multiple Orgs"
			let displayName: string
			if (orgGuids.length === 1) {
				displayName = orgNames[0]
			} else {
				displayName = 'Multiple Orgs'
			}

			onSubmit({
				organizationGuids: orgGuids,
				organizationName: displayName,
				organizationNames: orgNames,
				year: user.year,
				startDate,
				endDate: isSingleDateQuery ? startDate : endDate
			});
		}
	}

	useEffect(() => {
		if (!user.year)
			return;

		setStartDate(user.year.startDate)
		setEndDate(user.year.endDate)
	}, [user.year?.guid])

	// Auto-submit when all required fields are defined for the first time
	useEffect(() => {
		if (!hasAutoSubmitted && orgGuids.length > 0 && startDate && endDate) {
			setHasAutoSubmitted(true)
			submit()
		}
	}, [orgGuids, startDate, endDate, hasAutoSubmitted])

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
										<FormLabel htmlFor='org'>
											Organizations {orgGuids.length > 1 && `(${orgGuids.length})`}
										</FormLabel>
										<Combobox
											id='org'
											multiple={true}
											options={orgOptions}
											value={orgGuids}
											onChange={setOrganizations}
											placeholder="Select Organizations..."
											sortSelectedToTop={true}
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

						{/* Selected Organizations Display */}
						{orgGuids.length > 0 && (
							<div className="flex flex-col gap-1 ml-4 pl-4 border-l border-gray-300">
								<span className="text-sm font-medium text-gray-600">Selected Organizations:</span>
								<div className="flex flex-col gap-1 max-h-32 overflow-y-auto pl-1">
									{orgGuids.map(guid => {
										const orgName = guid === '' ? 'All Organizations' : user.organizations?.find(x => x.guid === guid)?.name || 'Unknown'
										return (
											<span key={guid} className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
												{orgName}
											</span>
										)
									})}
								</div>
							</div>
						)}
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