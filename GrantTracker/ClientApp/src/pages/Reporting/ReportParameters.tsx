import { useEffect, useState } from "react"
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap"
import { LocalDate } from "@js-joda/core"

import Dropdown from "components/Input/Dropdown"

import { OrganizationView, OrganizationYear, OrganizationYearDomain, OrganizationYearView, Quarter } from "Models/OrganizationYear"

import api, { AxiosIdentityConfig } from "utils/api"
import Select from "react-select"

export interface ReportParameters {
	organizationGuid: string | undefined
	organizationName: string | undefined
	organizationYearGuid: string | undefined
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
	const [organizations, setOrganizations] = useState<OrganizationView[]>([])
	const [organizationGuid, setOrgGuid] = useState<string | undefined>()

	const [organizationYearsAreLoading, setOrgYearsLoading] = useState<boolean>(false)
	const [organizationYears, setOrganizationYears] = useState<OrganizationYearView[]>([])
	const [organizationYearGuid, setOrgYearGuid] = useState<string | undefined>('')

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

		setOrgYearsLoading(true)
		getOrganizationYears(organizationGuid)
			.then(res => {
				setOrganizationYears(res)

				if (res.some(orgYear => orgYear.guid == AxiosIdentityConfig.identity.organizationYearGuid))
					var orgYearGuid: string |undefined = AxiosIdentityConfig.identity.organizationYearGuid //this should never NOT occur, really
				else if (res.length > 0 || !orgYearGuid)
					orgYearGuid = res[0].guid //but shit happens

				setOrgYearGuid(orgYearGuid)

				if (!startDate || !endDate) {
					let orgYear = res.find(orgYear => orgYear.guid == orgYearGuid)
					setStartDate(orgYear?.year.startDate)
					setEndDate(orgYear?.year.endDate)
				}
			})
			.finally(() => {
				setOrgYearsLoading(false)
			})
	}, [organizationGuid])

	if (!organizationGuid || !organizationYearGuid)
		return <Spinner animation="border" role="status" />

	return (
		<Container className='ms-0'>
			<Form>
				<Row>
					<Col sm={3} xs={6}> 
						<Form.Group>
							<Form.Label htmlFor='org'>Organization</Form.Label>
								<Select 
									id='org'
									options={organizations.map(org => ({ value: org.guid, label: org.name }))}
									value={{ value: organizationGuid, label: organizations.find(o => o.guid == organizationGuid)?.name}}
									onChange={option => setOrgGuid(option.value)}
								/>
						</Form.Group>
					</Col>
					<Col sm={3} xs={6}> 
						<Form.Group>
							<Form.Label htmlFor='school-year'>School Year <small>(Affects Staffing Only)</small></Form.Label> 
							{organizationYearsAreLoading ? <Spinner animation="border" role="status" /> :
								<Dropdown
									id='school-year'
									options={organizationYears.map(orgYear => ({
										guid: orgYear.guid,
										label: `${orgYear.year.schoolYear} - ${Quarter[orgYear.year.quarter]}`
									}))}
									value={organizationYearGuid}
									onChange={(orgYearGuid: string) => {setOrgYearGuid(orgYearGuid)}}
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
							organizationName: organizations?.find(x => x.guid == organizationGuid)?.name,
							organizationYearGuid,
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

function getOrganizationYears(organizationGuid: string): Promise<OrganizationYearView[]> {
	return new Promise((resolve, reject) => {
	  api
		.get<OrganizationYearDomain[]>('dropdown/year', { params: {organizationGuid}})
		.then(res => {
		  resolve(res.data.map(x => OrganizationYear.toViewModel(x)))
		})
		.catch(err => {
			reject()
		})
 	})
}