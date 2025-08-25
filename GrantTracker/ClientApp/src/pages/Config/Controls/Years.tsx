import { useState, useEffect, ReactElement } from 'react'
import { LocalDate, Year as JYear, DateTimeFormatter } from '@js-joda/core'
import { Button } from 'components/ui/button'
import { FormControl, FormGroup, FormLabel } from 'components/Form'
import { Quarter, YearDomain, YearView, Year } from 'Models/OrganizationYear'
import { DropdownOption } from 'Models/Session'
import { DataTable } from 'components/DataTable'
import api from 'utils/api'
import Dropdown from 'components/Input/Dropdown'
import { useQuery } from '@tanstack/react-query'
import { Locale } from '@js-joda/locale_en-us'
import { NIL as NullGuid } from 'uuid'
import { User } from 'utils/authentication'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { CornerDownLeft } from 'lucide-react'

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

	const columns: ColumnDef<YearView>[] = createColumns()
	const onRowClick = (event, row: YearView) => {
		setYearId(row.yearGuid)
		setEditing(true)
	}

	if (!years || yearsPending)
		return (
			<div className="flex flex-col items-center justify-center h-40 gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<small className='text-gray-500'>Loading Years...</small>
			</div>
		)

	return (
		<div className='space-y-6'>
			{
				editing 
					? (
						<>
							<YearEditor years={years} yearId={yearId} users={users} onChange={() => handleFormSubmission()} />
							<hr className='border-gray-200' />
						</>
					) 
					: <Button variant='secondary' onClick={() => setEditing(true)}>Create</Button>
			}

			{
				yearsPending ? (
					<div className="flex justify-center mt-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
					</div>
				) : yearFetchError ? (
					<div className='text-red-500'>{yearFetchError}</div>
				) : (
					<div className='mt-6'>
						<DataTable 
							columns={columns} 
							data={years} 
							onRowClick={onRowClick}
							initialSorting={[
								{id: 'schoolYear', desc: true},
								{id: 'quarter', desc: true}
							]}
							emptyMessage="No years found."
							className="hover:bg-gray-50 cursor-pointer"
						/>
					</div>
				)
			}
		</div>
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

	const userRowClick = (row: UserForm) => {
		const alteredUser: UserForm = {...row};
		alteredUser.include = !alteredUser.include;
		alterUser(alteredUser);
	}

	const userColumns: ColumnDef<UserForm>[] = createUserColumns(alterUser)

	useEffect(() => {
		if (!!yearId && yearForm.yearGuid != yearId) {
			setYearForm({ ...years.find(y => y.yearGuid == yearId)!, users: []})
		}
	}, [years?.length, yearId])

	useEffect(() => {
		setYearForm({...yearForm, users: users.map((user) => { const userForm: UserForm = {...user, include: true, organizationYear: null}; return userForm; })})
	}, [users])

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-3 p-4 bg-gray-600 text-white rounded-t-lg'>
				<Button variant='outline' size='sm' className='border-white text-gray-600 hover:text-white hover:bg-gray-600' onClick={() => cancelEdit()} aria-label="Cancel edit">
					<CornerDownLeft aria-hidden />
				</Button>
				<h5 className='text-lg font-semibold'>
					{yearId ? `Edit - ${originalYear.schoolYear} ${Quarter[originalYear.quarter]}` : 'Create New Year'}
				</h5>
			</div>

			{hasError && errors.length == 0 && (
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
					<h6 className='font-medium'>An unhandled error occured, please check the parameters and try again.</h6>
				</div>
			)}
			{errors.map((error, idx) => (
				<div key={idx} className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
					<h6 className='font-medium'>{error}</h6>
				</div>
			))}

			<div className='flex gap-6'>
				<div className='flex-1 grid grid-cols-2 gap-4'>
					<FormGroup>
						<FormLabel>Year</FormLabel>
						<FormControl
							type='number'
							value={yearForm.schoolYear}
							onChange={(e) => setYearForm({ ...yearForm, schoolYear: e.target.value })}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>Quarter</FormLabel>
						<Dropdown
							options={quarters}
							value={yearForm.quarter?.toString()}
							onChange={(quarter: string) => setYearForm({ ...yearForm, quarter: Number(quarter) })}
							disableOverlay
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>Start Date</FormLabel>
						<FormControl
							type='date'
							value={yearForm.startDate?.toString()}
							onChange={(e) => {
								if (e.target.value == '')
									return;

								const date: number[] = e.target.value.split('-').map(i => Number(i))
								setYearForm({ ...yearForm, startDate: LocalDate.of(date[0], date[1], date[2]) })
							}}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>End Date</FormLabel>
						<FormControl
							type='date'
							value={yearForm.endDate?.toString()}
							onChange={(e) => {
								if (e.target.value == '')
									return;

								const date: number[] = e.target.value.split('-').map(i => Number(i))
								setYearForm({ ...yearForm, endDate: LocalDate.of(date[0], date[1], date[2]) })
							}}
						/>
					</FormGroup>
				</div>

				<div className='flex items-end'>
					<Button disabled={!formIsValid} onClick={() => handleYearSubmission()}>Submit</Button>
				</div>
			</div>

			{!yearId && (
				<div className='space-y-3 mt-6'>
					<small className='text-gray-600'>({yearForm.users.filter(user => user.include).length} users selected)</small>
					<div className='bg-gray-600 text-white p-3 rounded-t-lg mb-0'>
						<h5 className='text-lg font-semibold'>Transfer Users</h5>
					</div>
					<div className='max-h-96 overflow-y-auto border border-gray-200 rounded-b-lg'>
						<DataTable 
							columns={userColumns}
							data={yearForm.users}
							initialSorting={[{id: 'lastName', desc: false}]}
							onRowClick={userRowClick}
							emptyMessage="No users found."
							className="hover:bg-gray-50 cursor-pointer"
							containerClassName="border-0 rounded-none"
						/>
					</div>
				</div>
			)}
		</div>
	)
}



const createColumns = (): ColumnDef<YearView>[] => [
	{
		header: 'Year',
		accessorKey: 'schoolYear'
	},
	{
		header: 'Quarter',
		accessorKey: 'quarter',
		cell: ({ row }) => Quarter[row.original.quarter]
	},
	{
		header: 'Start Date',
		accessorKey: 'startDate',
		cell: ({ row }) => row.original.startDate.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH))
	},
	{
		header: 'End Date',
		accessorKey: 'endDate',
		cell: ({ row }) => row.original.endDate.format(DateTimeFormatter.ofPattern('MM/dd/y').withLocale(Locale.ENGLISH))
	},
	{
		header: 'Is Active',
		accessorKey: 'isCurrentSchoolYear',
		cell: ({ row }) => row.original.isCurrentSchoolYear ? 'Yes' : 'No',
		filterFn: (row, id, value) => {
			if (value === '') return true
			const isActive = row.getValue(id) as boolean
			return value === 'true' ? isActive : !isActive
		},
		meta: {
			filterOptions: [
				{ value: 'true', label: 'Yes' },
				{ value: 'false', label: 'No' }
			]
		}
	},
	{
		header: 'Actions',
		id: 'actions',
		cell: ({ row }) => {
			const year = row.original
			return (
				<div className='space-y-2'>
					<Button 
						variant='outline' 
						size='sm' 
						className='w-full' 
						onClick={(e) => {
							e.stopPropagation()
							year.isCurrentSchoolYear = true
							api.patch('developer/year', year).then(res => console.log(res))
						}}
					>
						Set Active Year
					</Button>
					<SyncSynergyBtn yearGuid={year.yearGuid} />
				</div>
			)
		},
		enableSorting: false
	}
	//extra statistics
]

const SyncSynergyBtn = ({yearGuid}): ReactElement => {
	const [numRecordsUpdated, setNumRecordsUpdated] = useState<number | undefined>()
	const [loading, setLoading] = useState<boolean>(false)

	return (
		<div>
			<Button 
				variant='outline' 
				size='sm' 
				className='w-full' 
				onClick={(e) => {
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
				{loading ? (
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
				) : 'Sync Synergy'}
			</Button>
			{
				numRecordsUpdated == -1 && <div className='text-red-500 text-xs mt-1'>Failed to sync</div>
			}
		</div>
	)
}


const createUserColumns = (onChange): ColumnDef<UserForm>[] => ([
	{
		header: 'Transfer',
		id: 'transfer',
		cell: ({ row }) => {
			const user = row.original
			return (
				<div className='flex justify-center'>
					<input 
						type='checkbox' 
						className='rounded' 
						checked={user.include} 
						onChange={() => {
							const changedUser: UserForm = {...user, include: !user.include}
							onChange(changedUser)
						}} 
					/>
				</div>
			)
		},
		sortingFn: (rowA, rowB) => {
			const a = rowA.original.include.toString()
			const b = rowB.original.include.toString()
			return a.localeCompare(b)
		}
	},
	{
		header: 'First Name',
		accessorKey: 'firstName'
	},
	{
		header: 'Last Name',
		accessorKey: 'lastName'
	},
	{
		header: 'Badge Number',
		accessorKey: 'badgeNumber'
	},
	{
		header: 'Organization Name',
		accessorKey: 'organization.name'
	},
	{
		header: 'User Type',
		accessorKey: 'claim',
		cell: ({ row }) => row.original.claim === 0 ? 'Administrator' : 'Coordinator'
	}
  ])