import { useContext, useEffect, useState } from "react"
import { BlackoutDate, OrganizationBlackoutDateDomain, OrganizationBlackoutDateView } from 'Models/BlackoutDate'

import api from "utils/api"
import Table, { Column } from "components/BTable"
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import { DateTimeFormatter, LocalDate } from "@js-joda/core"
import { Locale } from "@js-joda/locale_en-us"
import { OrgYearContext } from ".."

export const BlackoutDateConfig = (): JSX.Element => {
	const { orgYear, setOrgYear } = useContext(OrgYearContext)
	const [blackoutFetchError, setBlackoutFetchError] = useState<string | undefined>()
	const [blackoutDates, setBlackoutDates] = useState<OrganizationBlackoutDateView[]>([])
	const [blackoutDatesAreLoading, setBlackoutDatesAreLoading] = useState<boolean>(false)

	const [blackoutDeleteError, setBlackoutDeleteError] = useState<string | undefined>()

	const getAndSetBlackoutDates = (orgGuid: string) => {
		setBlackoutDatesAreLoading(true)
		getBlackoutDates(orgGuid)
			.then(res => {
				setBlackoutDates(res)
				setBlackoutFetchError(undefined)
			})
			.catch(err => {
				setBlackoutFetchError(err)
			})
			.finally(() => {
				setBlackoutDatesAreLoading(false)
			})
	}

	useEffect(() => {
		getAndSetBlackoutDates(orgYear?.organization.guid)
	}, [orgYear])

	const blackoutColumns: Column[] = createBlackoutColumns(orgYear?.organization.guid, getAndSetBlackoutDates, setBlackoutDeleteError)

	let tableElement: JSX.Element = <></>
	if (blackoutDatesAreLoading)
		tableElement = <Spinner animation='border' role='status' /> 
	else if (blackoutDates && blackoutDates.length > 0)
		tableElement = <Table 
							className='m-0'
							columns={blackoutColumns}
							dataset={blackoutDates}
						/>

	return (
		<div className='mt-3'>
			<div className='text-danger'>{blackoutFetchError?.toString()}</div>
			<div className='text-danger'>{blackoutDeleteError?.toString()}</div>

			<BlackoutDateInput orgGuid={orgYear?.organization.guid} getAndSetBlackoutDates={getAndSetBlackoutDates} />

			<Row className='mt-3'>
				<Col className='ps-0' sm={6} xs={12}>
					{tableElement}
				</Col>
			</Row>
				
		</div>
	)
}

const BlackoutDateInput = ({orgGuid, getAndSetBlackoutDates}): JSX.Element => {
	const [blackoutDate, setBlackoutDate] = useState<LocalDate>(LocalDate.now)
	const [blackoutAddError, setBlackoutAddError] = useState<string | undefined>()

	const addDate = () => {
		addBlackoutDate(orgGuid, blackoutDate)
			.then(res => {
				setBlackoutAddError(undefined)
			})
			.catch(err => {
				if (err.response.status == 409)
					setBlackoutAddError('A blackout date already exists for this date.')
				else
					setBlackoutAddError(err)
			})
			.finally(() => {
				getAndSetBlackoutDates(orgGuid)
			})
	}

	return (
		<div>
			<Row className='text-danger ps-0'>{blackoutAddError}</Row>

			<Row>
				<Col sm={6} xs={12} className='ps-0'>
					<Form.Group>
						<Form.Label>Add Blackout Date</Form.Label>
						<Form.Control type='date' value={blackoutDate.toString()} onChange={(event) => setBlackoutDate(LocalDate.parse(event.target.value))} />
					</Form.Group>
				</Col>

				<Col sm={{span: 3, offset: 1}} xs={12}>
					<div className='d-flex align-items-end h-100'>
						<Button variant='primary' onClick={() => addDate()}>Add</Button>
					</div>
				</Col>
			</Row>

		</div>
	)
}

const createBlackoutColumns = (orgGuid: string, getAndSetBlackoutDates, setBlackoutDeleteError): Column[] => [
	{
		label: "Date",
		attributeKey: 'date',
		sortable: true,
		transform: (date: LocalDate) => <div className='text-end'>{date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}</div>
	},
	{
		label: '',
		attributeKey: '',
		sortable: false,
		transform: (blackoutDate: OrganizationBlackoutDateView) => {
			return (
				<div className='d-flex justify-content-center'>
					<Button 
						variant='danger' 
						onClick={() => {
							deleteBlackoutDate(orgGuid, blackoutDate.guid)
								.then(res => {
									getAndSetBlackoutDates(orgGuid)
									setBlackoutDeleteError(undefined)
								})
								.catch(err => {
									if (err.response.status == 404)
										setBlackoutDeleteError("Could not find a blackout date with the given identifier.")
									else 
										setBlackoutDeleteError(err)
								})
						}}
					>Delete
					</Button>
				</div>
			)
		}
	}
]

const getBlackoutDates = (orgGuid: string): Promise<OrganizationBlackoutDateView[]> => {
	return new Promise<OrganizationBlackoutDateView[]>((resolve, reject) => {
		api
			.get<OrganizationBlackoutDateDomain[]>(`organization/${orgGuid}/blackout`)
			.then(res => resolve(res.data.map(x => BlackoutDate.toViewModel(x))))
			.catch(err => reject(err))
	})
}

const addBlackoutDate = (orgGuid: string, date: LocalDate): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.post(`organization/${orgGuid}/blackout`, date)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}

const deleteBlackoutDate = (orgGuid: string, blackoutGuid: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.delete(`organization/${orgGuid}/blackout/${blackoutGuid}`)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}