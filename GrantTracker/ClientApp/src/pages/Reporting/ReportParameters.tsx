import { useContext, useEffect, useState } from "react"
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap"
import { LocalDate } from "@js-joda/core"

import Dropdown from "components/Input/Dropdown"

import { OrganizationView, OrganizationYearView, Quarter, Year, YearDomain, YearView } from "Models/OrganizationYear"

import api from "utils/api"
import Select from "react-select"
import { IdentityClaim } from "utils/authentication"
import { AppContext } from "App"

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

	const [isSingleDateQuery, setIsSingleDateQuery] = useState<boolean>(false)

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

	useEffect(() => {
		if (!user.year)
			return

		setStartDate(user.year.startDate)
		setEndDate(user.year.endDate)
	}, [user.year?.guid])

	const orgOptions = user.claim == IdentityClaim.Administrator 
		? [{ value: '', label: 'All' }, ...user.organizations.map(org => ({ value: org.guid, label: org.name }))]
		: user.organizations.map(org => ({ value: org.guid, label: org.name }))

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
									value={{ value: orgGuid, label: orgGuid == '' ? 'All' : user.organizations.find(o => o.guid == user.organization.guid)?.name}}
									onChange={option => setOrganization(option.value)}
								/>
						</Form.Group>
					</Col>
					<Col sm={3} xs={6}> 
						<Form.Group>
							<Form.Label htmlFor='school-year'>School Year <small>(Affects Staffing Only)</small></Form.Label> 
								<Dropdown
									id='school-year'
									options={user.years.map(year => ({
										guid: year.guid,
										label: `${year.schoolYear} - ${Quarter[year.quarter]}`
									}))}
									value={user.year.guid}
									onChange={(yearGuid: string) => setYear(yearGuid)}
								/>
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
							organizationGuid: orgGuid,
							organizationName: user.organizations?.find(x => x.guid == orgGuid)?.name || 'All Organizations',
							year: user.year,
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