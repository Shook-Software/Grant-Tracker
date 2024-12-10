import { useState, useEffect, ReactElement } from 'react'
import { LocalDate, Year as JYear, DateTimeFormatter } from '@js-joda/core'
import { Row, Col, Modal, Form, Button, Spinner, Tab } from 'react-bootstrap'
import { Quarter, YearDomain, YearView, Year } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'
import Table, { Column, SortDirection } from "components/BTable"
import api from 'utils/api'
import Dropdown from 'components/Input/Dropdown'
import { useQuery } from '@tanstack/react-query'
import { Locale } from '@js-joda/locale_en-us'
import { NIL as NullGuid } from 'uuid'
import { User } from 'utils/authentication'

export default (): JSX.Element => {
	const { isPending: yearsPending, data: years, error: yearFetchError, refetch: refetchYears } = useQuery({
		queryKey: ['developer/year'],
		staleTime: Infinity,
		placeholderData: [],
		select: (years: YearDomain[]) => years.map(year => Year.toViewModel(year))
	})

	const { isPending: usersPending, data: users, error: userFetchError, refetch: refetchUsers } = useQuery<User[]>({
		queryKey: ['developer/authentication'],
		staleTime: Infinity,
		placeholderData: []
	})

	const [editing, setEditing] = useState<boolean>(false)
	const [yearId, setYearId] = useState<string | null>(null)

	function handleFormSubmission() {
		refetchYears()
		setYearId(null)
		setEditing(false)
	}

	const columns: Column[] = createColumns()
	const onRowClick = (event, row: YearView) => {
		setYearId(row.yearGuid)
		setEditing(true)
	}

	if (!years || yearsPending)
		return <div>Loading...</div>

	return (
		<>
			{
				editing 
					? <><YearEditor years={years} yearId={yearId} users={users} onChange={() => handleFormSubmission()} /><hr /></> 
					: <button className='btn btn-secondary' type='button' onClick={() => setEditing(true)}>Create</button>
			}

			{
				yearsPending ? <Spinner className='mt-3' animation='border' role='status' />
					: yearFetchError ? <div className='text-danger'>{yearFetchError}</div>
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
	users: User[]
	onChange: () => void
}

interface UserForm extends User {
	include: boolean
}

interface YearForm extends YearView {
	users: UserForm[]
}

const YearEditor = ({ years, yearId, users, onChange }: YearEditorProps) => {
	const [hasError, setHasError] = useState<boolean>(false)
	const [errors, setErrors] = useState<string[]>([])
	const [yearForm, setYearForm] = useState<YearForm>({
		yearGuid: '',
		isCurrentYear: false,
		schoolYear: JYear.now().toString(),
		startDate: LocalDate.now(),
		endDate: LocalDate.now(),
		quarter: Quarter['Summer'],
		users: []
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

	function cancelEdit(): void {
		setYearForm({
			yearGuid: '',
			isCurrentYear: false,
			schoolYear: JYear.now().toString(),
			startDate: LocalDate.now(),
			endDate: LocalDate.now(),
			quarter: Quarter['Summer'],
			users: yearForm.users
		})
		onChange()
	}
	
	function handleYearSubmission(): void {
		setErrors([])
		setHasError(false)

		if (yearId)
			api.patch('developer/year', yearForm)
				.then(() => { 
					onChange()
				})
				.catch(err => {
					if (Array.isArray(err.response.data))
						setErrors(err.response.data || [])
					setHasError(true)
				})
		else {
			yearForm.yearGuid = NullGuid

			api.post('developer/year', {...yearForm, users: yearForm.users.filter(user => user.include)})
				.then(() => { 
					onChange()
				})
				.catch(err => {
					if (Array.isArray(err.response.data))
						setErrors(err.response.data || [])
					setHasError(true)
				})
		}
	}

	function alterUser(alteredUser: UserForm) {
		setYearForm({...yearForm, users: yearForm.users.map(user => { 
			if (user.badgeNumber === alteredUser.badgeNumber)
				return {...alteredUser};
			return user;
		})})
	}

	const formIsValid: boolean = true;
	const originalYear: YearView = {...years.find(y => y.yearGuid == yearId)!}

	const userRowClick = (event, row: UserForm) => {
		const alteredUser: UserForm = {...row};
		alteredUser.include = !alteredUser.include;
		alterUser(alteredUser);
	}

	const userColumns: Column[] = createUserColumns(alterUser)

	useEffect(() => {
		if (!!yearId && yearForm.yearGuid != yearId) {
			setYearForm({ ...years.find(y => y.yearGuid == yearId)!, users: []})
		}
	}, [years?.length, yearId])

	useEffect(() => {
		setYearForm({...yearForm, users: users.map((user) => { const userForm: UserForm = {...user, include: true, organizationYear: null}; return userForm; })})
	}, [users])

	return (
		<div className='row'>
			<h5 className='p-2 bg-secondary text-white'>
				<button type='button' className='btn btn-sm btn-outline-light me-2' onClick={() => cancelEdit()}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5"/>
					</svg>
				</button>
				{yearId ? `Edit - ${originalYear.schoolYear} ${Quarter[originalYear.quarter]}` : 'Create New Year'}
			</h5>
			{hasError && errors.length == 0 ? <h6 className='text-danger'>An unhandled error occured, please check the parameters and try again.</h6> : null}
			{errors.map(error => <h6 className='text-danger'>{error}</h6>)}
			<div className='col-lg-9'>
				<div className='row'>
					<div className='col-lg-6'>
						<Form.Group>
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
									if (e.target.value == '')
										return;

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
									if (e.target.value == '')
										return;

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

			<div className={'col-12 p-0 d-flex flex-column' + (!!yearId ? ' d-none' : ' mt-3')}>
			<small>({yearForm.users.filter(user => user.include).length} users selected)</small>
				<h5 className='w-100 p-2 bg-secondary text-white mb-0'>Transfer Users</h5>
				<div style={{maxHeight: '30rem', overflowY: 'auto'}}>
					<Table columns={userColumns}
							dataset={yearForm.users}
							tableProps={{ className: 'm-0'}}
							defaultSort={{ index: 2, direction: SortDirection.Ascending }}
							rowProps={{ key: 'userOrganizationYearGuid', onClick: userRowClick }} />
				</div>
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
		attributeKey: '',
		transform: (year) => (
			<div>
				<button className='btn btn-sm btn-outline-primary w-100 mb-1' onClick={(e) => {
					e.stopPropagation()
					year.isCurrentSchoolYear = true
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
			<button className='btn btn-sm btn-outline-primary w-100' onClick={(e) => {
				e.stopPropagation()
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


const createUserColumns = (onChange): Column[] => ([
	{
		label: 'Transfer',
		attributeKey: '',
		sortable: true,
		sortTransform: (user: UserForm) => user.include.toString(),
		transform: (user: UserForm) => <div className='form-check'>
			<input className='form-check-input' type='checkbox' checked={user.include} onChange={() => {
				const changedUser: UserForm = {...user, include: !user.include}
				onChange(changedUser)
			}} />
		</div>
	},
	{
	  label: 'First Name',
	  attributeKey: 'firstName',
	  sortable: true
	},
	{
	  label: 'Last Name',
	  attributeKey: 'lastName',
	  sortable: true
	},
	{
	  label: 'Badge Number',
	  attributeKey: 'badgeNumber',
	  sortable: true
	},
	{
	  label: 'Organization Name',
	  attributeKey: 'organization.name',
	  sortable: true
	},
	{
	  label: 'User Type',
	  attributeKey: 'claim',
	  sortable: true,
	  transform: (claim: number) => claim === 0 ? 'Administrator' : 'Coordinator'
	}
  ])