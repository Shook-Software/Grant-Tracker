import { useEffect, useState } from "react"
import { BlackoutDate, BlackoutDateDomain, BlackoutDateView } from 'Models/BlackoutDate'

import api, { AxiosIdentityConfig } from "utils/api"
import Table, { Column } from "components/BTable"
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import { DateTimeFormatter, LocalDate } from "@js-joda/core"
import { Locale } from "@js-joda/locale_en-us"

export const BlackoutDateConfig = ():JSX.Element => {
	const [blackoutFetchError, setBlackoutFetchError] = useState<string | undefined>()
	const [blackoutDates, setBlackoutDates] = useState<BlackoutDateView[]>([])
	const [blackoutDatesAreLoading, setBlackoutDatesAreLoading] = useState<boolean>(false)

	const [blackoutDeleteError, setBlackoutDeleteError] = useState<string | undefined>()

	const getAndSetBlackoutDates = () => {
		setBlackoutDatesAreLoading(true)
		getBlackoutDates()
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
		getAndSetBlackoutDates()
	}, [AxiosIdentityConfig.identity.organizationGuid])

	const blackoutColumns: Column[] = createBlackoutColumns(getAndSetBlackoutDates, setBlackoutDeleteError)

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
			<div className='text-danger'>{blackoutFetchError}</div>
			<div className='text-danger'>{blackoutDeleteError}</div>

			<BlackoutDateInput getAndSetBlackoutDates={getAndSetBlackoutDates} />

			<Row className='mt-3'>
				<Col className='ps-0' sm={6} xs={12}>
					{tableElement}
				</Col>
			</Row>
				
		</div>
	)
}

const BlackoutDateInput = ({getAndSetBlackoutDates}): JSX.Element => {
	const [blackoutDate, setBlackoutDate] = useState<LocalDate>(LocalDate.now)
	const [blackoutAddError, setBlackoutAddError] = useState<string | undefined>()

	console.log(blackoutDate)

	const addDate = () => {
		addBlackoutDate(blackoutDate)
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
				getAndSetBlackoutDates()
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

const createBlackoutColumns = (getAndSetBlackoutDates, setBlackoutDeleteError): Column[] => [
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
		transform: (blackoutDate: BlackoutDateView) => {
			return (
				<div className='d-flex justify-content-center'>
					<Button 
						variant='danger' 
						onClick={() => {
							deleteBlackoutDate(blackoutDate.guid)
								.then(res => {
									getAndSetBlackoutDates()
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

const getBlackoutDates = (): Promise<BlackoutDateView[]> => {
	return new Promise<BlackoutDateView[]>((resolve, reject) => {
		api
			.get<BlackoutDateDomain[]>(`organization/${AxiosIdentityConfig.identity.organizationGuid}/blackout`)
			.then(res => resolve(res.data.map(x => BlackoutDate.toViewModel(x))))
			.catch(err => reject(err))
	})
}

const addBlackoutDate = (date: LocalDate): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.post(`organization/${AxiosIdentityConfig.identity.organizationGuid}/blackout`, date)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}

const deleteBlackoutDate = (guid: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.delete(`organization/${AxiosIdentityConfig.identity.organizationGuid}/blackout/${guid}`)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}