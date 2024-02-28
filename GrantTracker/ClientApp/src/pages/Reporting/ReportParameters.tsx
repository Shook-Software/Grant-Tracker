import { useEffect, useState } from "react"
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap"
import { LocalDate } from "@js-joda/core"

import Dropdown from "components/Input/Dropdown"

import { OrganizationView, OrganizationYear, OrganizationYearDomain, OrganizationYearView, Quarter, Year, YearDomain, YearView } from "Models/OrganizationYear"

import api, { AxiosIdentityConfig } from "utils/api"
import Select from "react-select"
import { IdentityClaim } from "utils/authentication"

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

export default ({user, onSubmit}): JSX.Element => {
	const [organizations, setOrganizations] = useState<OrganizationView[]>([])
	const [organizationGuid, setOrgGuid] = useState<string | undefined>()

	const [yearsAreLoading, setYearsAreLoading] = useState<boolean>(false)
	const [years, setYears] = useState<YearView[]>([])
	const [year, setYear] = useState<YearView | null>()

	const [startDate, setStartDate] = useState<LocalDate | undefined>()
	const [endDate, setEndDate] = useState<LocalDate | undefined>()

	const [isSingleDateQuery, setIsSingleDateQuery] = useState<boolean>(false)

	useEffect(() => {
		getAuthorizedOrganizations()
			.then(res => {
				setOrganizations(res)

				if (res.some(org => org.guid == AxiosIdentityConfig.identity.organizationGuid))
					setOrgGuid(AxiosIdentityConfig.identity.organizationGuid) //this should never NOT occur, really
				else if (res.length > 0)
					setOrgGuid(res[0].guid) //but shit happens
			})
			.finally(() => {
			})
	}, [])

	useEffect(() => {
		if (!organizationGuid)
			return

		setYearsAreLoading(true)
		getYears(organizationGuid)
			.then(yearViews => {
				setYears(yearViews)

				if (yearViews.some(orgYear => orgYear.guid == AxiosIdentityConfig.identity.organizationYearGuid))
					setYear(yearViews.find(oy => oy.guid === AxiosIdentityConfig.identity.organizationYearGuid))
				else if (yearViews.length > 0)
					setYear(yearViews.find(y => y.isCurrentYear) || yearViews[0])
			})
			.finally(() => {
				setYearsAreLoading(false)
			})
	}, [organizationGuid])

	useEffect(() => {
		if (!year)
			return

		setStartDate(year.startDate)
		setEndDate(year.endDate)
	}, [year?.guid])

	if (organizationGuid == undefined || !year)
		return <Spinner animation="border" role="status" />

	const orgOptions = user.claim == IdentityClaim.Administrator 
		? [{ value: '', label: 'All' }, ...organizations.map(org => ({ value: org.guid, label: org.name }))]
		: organizations.map(org => ({ value: org.guid, label: org.name }))

	return (
		<Container className='ms-0'>
			<Form>
				<Row className='mb-3'>
					<Col sm={3} xs={6}> 
						<Form.Group>
							<Form.Label htmlFor='org'>Organization</Form.Label>
								<Select 
									id='org'
									options={orgOptions}
									value={{ value: organizationGuid, label: organizations.find(o => o.guid == organizationGuid)?.name}}
									onChange={option => setOrgGuid(option.value)}
								/>
						</Form.Group>
					</Col>
					<Col sm={3} xs={6}> 
						<Form.Group>
							<Form.Label htmlFor='school-year'>School Year <small>(Affects Staffing Only)</small></Form.Label> 
							{yearsAreLoading ? <Spinner animation="border" role="status" /> :
								<Dropdown
									id='school-year'
									options={years.map(year => ({
										guid: year.guid,
										label: `${year.schoolYear} - ${Quarter[year.quarter]}`
									}))}
									value={year.guid}
									onChange={(yearGuid: string) => {setYear(years.find(year => year.guid == yearGuid))}}
								/>
							}
						</Form.Group>
					</Col>
				</Row>
				<Row>

					<Col xs={1} className={isSingleDateQuery ? 'd-flex align-items-center justify-content-evenly px-0' : 'd-none'}>
						<Button type='button' size='sm' className='d-flex' onClick={() => setStartDate(previousMonday(startDate))}>&#11164;&#11164;</Button>
						<Button type='button' size='sm' className='d-flex' onClick={() => setStartDate(startDate?.plusDays(-1))}>&#11164;</Button>
					</Col>
					
					<Col sm={3} xs={6}>
						<Form.Group>
							<Form.Label htmlFor='start-date'>{isSingleDateQuery ? 'Date' : 'Start Date'}</Form.Label>
							<Form.Control 
								type='date' 
								id='start-date' 
								value={startDate?.toString()}
								onChange={(e) => setStartDate(LocalDate.parse(e.target.value))}
							/>
							<Form.Check
								type='checkbox'
								id='single-date-checkbox'
								label='Query single date'
								checked={isSingleDateQuery}
								onChange={(e) => setIsSingleDateQuery(e.target.checked)}
							/>
						</Form.Group>
					</Col>

					<Col xs={1} className={isSingleDateQuery ? 'd-flex align-items-center justify-content-evenly px-0' : 'd-none'}>
						<Button type='button' size='sm' className='d-flex' onClick={() => setStartDate(startDate?.plusDays(1))}>&#11166;</Button>
						<Button type='button' size='sm' className='d-flex' onClick={() => setStartDate(nextMonday(startDate))}>&#11166;&#11166;</Button>
					</Col>

					<Col sm={3} xs={6} className={isSingleDateQuery ? 'd-none' : ''}>
						<Form.Group>
							<Form.Label htmlFor='end-date'>End Date</Form.Label>
							<Form.Control 
								type='date'
								id='end-date' 
								value={endDate?.toString()}
								onChange={(e) => setEndDate(LocalDate.parse(e.target.value))}
							/>
						</Form.Group>
					</Col>
					
					<Col sm={3} xs={6} className='d-flex align-items-center'>	
						<Button onClick={() => onSubmit({
							organizationGuid,
							organizationName: organizations?.find(x => x.guid == organizationGuid)?.name || 'All Organizations',
							year,
							startDate,
							endDate: isSingleDateQuery ? startDate : endDate
						})}>
							Submit
						</Button>
					</Col>
				</Row>
			</Form>
		</Container>
	)
}

function getAuthorizedOrganizations(): Promise<OrganizationView[]> {
	return new Promise((resolve, reject) => {
	  api
		.get<OrganizationView[]>('dropdown/organization')
		.then(res => {
		  resolve(res.data)
		})
		.catch(err => {
			reject()
		})
	})
  }

function getYears(organizationGuid: string): Promise<YearView[]> {
	return new Promise((resolve, reject) => {
	  api
		.get<YearDomain[]>('dropdown/year', { params: {organizationGuid}})
		.then(res => {
		  resolve(res.data.map(x => Year.toViewModel(x)))
		})
		.catch(err => {
			reject()
		})
 	})
}