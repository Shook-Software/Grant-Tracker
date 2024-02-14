import { useState, useEffect, ReactElement } from 'react'
import { LocalDate, Year as JYear, DateTimeFormatter } from '@js-joda/core'
import { Row, Col, Modal, Form, Button, Spinner } from 'react-bootstrap'
import { DateOnly } from "Models/DateOnly"
import { Quarter, YearDomain, YearView, Year } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'
import Table, { Column } from "components/BTable"
import api from 'utils/api'
import Dropdown from 'components/Input/Dropdown'
import { useQuery } from '@tanstack/react-query'
import { Locale } from '@js-joda/locale_en-us'
import { NIL as NullGuid } from 'uuid'




export default (): JSX.Element => {
	const { isPending, data: years, error, refetch } = useQuery({
		queryKey: ['developer/year'],
		staleTime: Infinity,
		select: (years: YearDomain[]) => years.map(year => Year.toViewModel(year))
	})
	const [editing, setEditing] = useState<boolean>(false)
	const [yearId, setYearId] = useState<string | null>(null)

	function handleFormSubmission() {
		refetch()
		setYearId(null)
		setEditing(false)
	}

	const columns: Column[] = createColumns()
	const onRowClick = (event, row: YearView) => {
		setYearId(row.yearGuid)
		setEditing(true)
	}

	if (!years)
		return <div>Loading...</div>

	return (
		<>
			{
				editing 
					? <><YearEditor years={years} yearId={yearId} onChange={() => handleFormSubmission()} /><hr /></> 
					: <button className='btn btn-secondary' type='button' onClick={() => setEditing(true)}>Create</button>
			}

			{
				isPending ? <Spinner className='mt-3' animation='border' role='status' />
					: error ? <div className='text-danger'>{error}</div>
						: <>
							<Row className='my-3'>
								<Table dataset={years} columns={columns} rowProps={{ onClick: onRowClick }} />
							</Row>
						</>
			}
		</>
	)
}

interface YearEditorProps {
	years: YearView[]
	yearId: string | null
	onChange: () => void
}

const YearEditor = ({ years, yearId, onChange }: YearEditorProps) => {
	const [hasError, setHasError] = useState<boolean>(false)
	const [yearForm, setYearForm] = useState<YearView>({
		yearGuid: '',
		isCurrentYear: false,
		schoolYear: JYear.now().toString(),
		startDate: LocalDate.now(),
		endDate: LocalDate.now(),
		quarter: Quarter['Summer']
	})

	const quarters: DropdownOption[] = [
		{
			guid: Quarter['Summer'].toString(),
			label: 'Summer'
		},
		{
			guid: Quarter['Academic Year'].toString(),
			label: 'Academic Year'
		}
	]
	
	function handleYearSubmission(): void {
		if (yearId)
			api.patch('developer/year', yearForm)
				.then(() => { 
					setHasError(false)
					onChange()
				})
				.catch(err => {
					setHasError(true)
				})
		else {
			yearForm.yearGuid = NullGuid

			api.post('developer/year', yearForm)
				.then(() => { 
					setHasError(false)
					onChange()
				})
				.catch(err => {
					setHasError(true)
				})
		}
		
	}

	useEffect(() => {
		if (yearId && yearForm.yearGuid != yearId) {
			setYearForm({ ...years.find(y => y.yearGuid == yearId)!})
		}
	}, [years?.length, yearId])

	const formIsValid: boolean = true;
	const originalYear: YearView = {...years.find(y => y.yearGuid == yearId)!}

	return (
		<div className='row'>
			<h5>{yearId ? `Editing - ${originalYear.schoolYear} ${Quarter[originalYear.quarter]}` : 'Creating'}</h5>
			{hasError ? <h6 className='text-danger'>An unhandled error occured, please check the parameters and try again.</h6> : null}
			<div className='col-lg-9'>
				<div className='row'>
					<div className='col-lg-6'>
						<Form.Group >
							<Form.Label>Year</Form.Label>
							<Form.Control
								type='number'
								value={yearForm.schoolYear}
								onChange={(e) => setYearForm({ ...yearForm, schoolYear: e.target.value })}
							/>
						</Form.Group>
					</div>

					<div className='col-lg-6'>
						<Form.Group>
							<Form.Label>Quarter</Form.Label>
							<Dropdown
								options={quarters}
								value={yearForm.quarter?.toString()}
								onChange={(quarter: string) => setYearForm({ ...yearForm, quarter: Number(quarter) })}
								disableOverlay
							/>
						</Form.Group>
					</div>

					<div className='col-lg-6'>
						<Form.Group>
							<Form.Label>Start Date</Form.Label>
							<Form.Control
								type='date'
								value={yearForm.startDate?.toString()}
								onChange={(e) => {
									const date: number[] = e.target.value.split('-').map(i => Number(i))
									setYearForm({ ...yearForm, startDate: LocalDate.of(date[0], date[1], date[2]) })
								}}
							/>
						</Form.Group>
					</div>

					<div className='col-lg-6'>
						<Form.Group>
							<Form.Label>End Date</Form.Label>
							<Form.Control
								type='date'
								value={yearForm.endDate?.toString()}
								onChange={(e) => {
									const date: number[] = e.target.value.split('-').map(i => Number(i))
									setYearForm({ ...yearForm, endDate: LocalDate.of(date[0], date[1], date[2]) })
								}}
							/>
						</Form.Group>
					</div>
				</div>
			</div>

			<div className='col-lg-3 d-flex align-items-end'>
				<button className='btn btn-primary' type='button' disabled={!formIsValid} onClick={() => handleYearSubmission()}>Submit</button>
			</div>
		</div>
	)
}



const createColumns = (): Column[] => [
	{
		label: 'Year',
		attributeKey: 'schoolYear',
		sortable: true
	},
	{
		label: 'Quarter',
		attributeKey: 'quarter',
		transform: (quarter) => Quarter[quarter],
		sortable: true
	},
	{
		label: 'Start Date',
		attributeKey: 'startDate',
		transform: (value: LocalDate) => value.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH)),
		sortable: true
	},
	{
		label: 'End Date',
		attributeKey: 'endDate',
		transform: (value: LocalDate) => value.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH)),
		sortable: true
	},
	{
		label: 'Is Active',
		attributeKey: 'isCurrentSchoolYear',
		transform: (isCurrent: boolean) => isCurrent ? 'Yes' : 'No',
		sortable: true
	},
	{
		label: 'Actions',
		attributeKey: 'yearGuid',
		transform: (year) => (
			<div>
				<button className='btn btn-sm btn-outline-primary w-100 mb-1' onClick={() => {
					year.isCurrentSchoolYear = true
					year.startDate = DateOnly.toLocalDate(year.startDate)
					year.endDate = DateOnly.toLocalDate(year.endDate)
					api
						.patch('developer/year', year)
						.then(res => console.log(res))
				}}>
					Set Active Year
				</button>
				<SyncSynergyBtn yearGuid={year.yearGuid} />
			</div>
		),
		sortable: false
	}
	//extra statistics
]

const SyncSynergyBtn = ({yearGuid}): ReactElement => {
	const [numRecordsUpdated, setNumRecordsUpdated] = useState<number | undefined>()
	const [loading, setLoading] = useState<boolean>(false)

	return (
		<div>
			<button className='btn btn-sm btn-outline-primary w-100' onClick={() => {
				setLoading(true)
				api
					.patch(`developer/year/${yearGuid}/grades/sync`)
					.then(res => {
						setNumRecordsUpdated(res.data)
					})
					.catch(err => {
						setNumRecordsUpdated(-1)
					})
					.finally(() => {
						setLoading(false)
					})
			}}
				disabled={loading}
			>
				{loading ? <Spinner animation="border" role="status" /> : 'Sync Synergy'}
			</button>
			{
				numRecordsUpdated == -1 ? <div className='text-danger'>Failed to sync</div> : null
			}
		</div>
	)
}