import { useEffect, useState } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import Dropdown from 'components/Input/Dropdown'
import { DataTable } from 'components/DataTable'
import { Button } from 'components/ui/button'
import { Quarter } from 'Models/OrganizationYear'
import { ColumnDef } from '@tanstack/react-table'
import api from 'utils/api'

export default ({}): JSX.Element => {

	const [secondColumnTransform, setSecondColumnTransform] = useState<string>('orgYears')
	const [showOrgToast, setShowOrgToast] = useState<boolean>(false)
	const [deletedOrg, setDeletedOrg] = useState(null)
	const [orgDeleteError, setOrgDeleteError] = useState<boolean>()

	const [showOrgYearToast, setShowOrgYearToast] = useState<boolean>(false)
	const [deletedOrgYear, setDeletedOrgYear] = useState(null)
	const [orgYearDeleteError, setOrgYearDeleteError] = useState<boolean>()

	const { isPending: organizationsAreLoading, data: organizations, error: orgFetchError, refetch: refetchOrganizations, } = useQuery({
		queryKey: ['organizations'],
		queryFn: () => api.get('organization').then(res => res.data)
	  }, new QueryClient())
  
	const deleteOrganizationYear = (organizationGuid, organizationYearGuid): Promise<void> => (
		api
			.delete(`organizationYear/${organizationYearGuid}`)
			.then(() => {})
			.catch((err) => {
				setOrgYearDeleteError(true)
			})
			.finally(() => {
				let orgYear = organizations.find(x => x.guid == organizationGuid).organizationYears.find(x => x.guid == organizationYearGuid)
				setDeletedOrgYear(orgYear)
				setShowOrgYearToast(true)
				refetchOrganizations()
			})
	)

	const deleteOrganization = (organizationGuid): Promise<void> => (
		api
			.delete(`organization/${organizationGuid}`)
			.then(() => {})
			.catch((err) => {
				setOrgDeleteError(true)
				setShowOrgToast(true)
			})
			.finally(() => {
				let deletedOrg = organizations.find(x => x.guid == organizationGuid)
				setDeletedOrg(deletedOrg)
				setShowOrgToast(true)
				refetchOrganizations()
			})
	)

	if (organizationsAreLoading)
		return (
			<div className="flex flex-col items-center justify-center h-40 gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<small className='text-gray-500'>Loading Organizations...</small>
			</div>
		)
	else if (orgFetchError)
		return <div className='text-red-500'>{orgFetchError}</div>

	const orgYearColumns: ColumnDef<any>[] = createOrgYearColumns(deleteOrganizationYear)
	const orgColumns: ColumnDef<any>[] = createOrgColumns(deleteOrganization, secondColumnTransform, setSecondColumnTransform, orgYearColumns)

	return (
		<div className='space-y-4'>
			{showOrgToast && (
				<div className={`flex justify-center`}>
					<div className={`max-w-md w-full border rounded-lg shadow-lg p-4 ${orgDeleteError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
						<div className='flex justify-between items-start'>
							<div>
								<h5 className={`font-medium ${orgDeleteError ? 'text-red-800' : 'text-green-800'}`}>
									{orgDeleteError ? 'Error' : 'Successful Deletion'}
								</h5>
								<p className={`text-sm ${orgDeleteError ? 'text-red-700' : 'text-green-700'}`}>
									{orgDeleteError ? 'An error occured while trying to delete the organization.' : `${deletedOrg?.name} was deleted.`}
								</p>
							</div>
							<button onClick={() => setShowOrgToast(false)} className={`text-gray-400 hover:text-gray-600`}>
								×
							</button>
						</div>
					</div>
				</div>
			)}
	
			{showOrgYearToast && (
				<div className="flex justify-center">
					<div className={`max-w-md w-full border rounded-lg shadow-lg p-4 ${orgYearDeleteError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
						<div className='flex justify-between items-start'>
							<div>
								<h5 className={`font-medium ${orgYearDeleteError ? 'text-red-800' : 'text-green-800'}`}>
									{orgYearDeleteError ? 'Error' : 'Successful Deletion'}
								</h5>
								<p className={`text-sm ${orgYearDeleteError ? 'text-red-700' : 'text-green-700'}`}>
									{orgYearDeleteError ? 'An error occured while trying to delete the organization.' : `${deletedOrgYear?.organization.name}, ${deletedOrgYear?.year.schoolYear} - ${Quarter[deletedOrgYear?.year.quarter]} was deleted.`}
								</p>
							</div>
							<button onClick={() => setShowOrgYearToast(false)} className='text-gray-400 hover:text-gray-600'>
								×
							</button>
						</div>
					</div>
				</div>
			)}
			<div className="flex">
				<Button onClick={() => null}>
					Add Organization (Synergy)
				</Button>
			</div>

			<div className='mt-6'>
				<DataTable 
					columns={orgColumns} 
					data={organizations || []} 
					emptyMessage="No organizations found."
					className="hover:bg-gray-50"
					containerClassName="w-full"
				/>
			</div>
		</div>
	)
}

const createOrgYearColumns = (deleteOrgYear): ColumnDef<any>[] => [
	{
		header: 'Year',
		accessorKey: 'year.schoolYear'
	}, 
	{
		header: 'Quarter',
		accessorKey: 'year.quarter',
		cell: ({ row }) => Quarter[row.original.year.quarter]
	},
	{
		header: 'Actions',
		id: 'actions',
		cell: ({ row }) => {
			const orgYear = row.original
			const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)

			const deletionConfirmationPhrase: JSX.Element = (
				<span>
					the organization year <span className='text-red-600 font-semibold'>{orgYear.orgName}, {orgYear.year.schoolYear} - {Quarter[orgYear.year.quarter]}</span> including all student, instructor, and attendance information
				</span>
			)

			return (
				<div className='flex justify-center items-center'>
					<Button variant="destructive" size="sm" onClick={() => setShowDeletionModal(true)}>
						Delete
					</Button>

					{showDeletionModal && (
						<ConfirmDeletionModal 
							showModal={showDeletionModal}
							handleClose={() => setShowDeletionModal(false)} 
							confirmationPhrase={deletionConfirmationPhrase}
							deletionCallback={() => deleteOrgYear(orgYear.organization.guid, orgYear.guid)} 
						/>
					)}
				</div>
			)
		},
		enableSorting: false
	}
]

const orgYearColumnTransform: (organization, orgYearColumns) => JSX.Element = (organization, orgYearColumns) => {
	if (!organization)
		return <></>

	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div className='border border-gray-200 rounded-lg'>
			<button 
				className='w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 focus:outline-none'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span className='font-medium'>Years</span>
				<svg 
					className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
					fill='none' 
					stroke='currentColor' 
					viewBox='0 0 24 24'
				>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
				</svg>
			</button>
			{isExpanded && (
				<div className='border-t border-gray-200'>
					<DataTable 
						columns={orgYearColumns}
						data={organization.organizationYears.map(oy => ({...oy, orgName: organization.name, orgGuid: organization.guid}))}
						emptyMessage="No organization years found."
						containerClassName='border-0 rounded-none w-full'
					/>
				</div>
			)}
		</div>
	)
}

const NewAttendanceGoalFormRow = ({onSubmit}): JSX.Element => {
	const [goal, setGoal] = useState({
		startDate: (new Date()).toISOString().slice(0, 10),
		endDate: (new Date()).toISOString().slice(0, 10),
		regularAttendees: 0
	})

	function handleSubmit() {
		onSubmit(goal)
			.then(res => {
				setGoal({
					startDate: (new Date()).toISOString().slice(0, 10),
					endDate: (new Date()).toISOString().slice(0, 10),
					regularAttendees: 0
				})
			})
	}

  return (
	<div className='flex gap-2'>
		<div className='flex-[2]'>
			<input 
				className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
				type='date' 
				value={goal.startDate} 
				onChange={(e) => {
					goal.startDate = e.target.value
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='flex-[2]'>
			<input 
				className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
				type='date' 
				value={goal.endDate} 
				onChange={(e) => {
					goal.endDate = e.target.value
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='flex-1'>
			<input 
				className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
				type='number' 
				value={goal.regularAttendees} 
				onChange={(e) => {
					goal.regularAttendees = Number(e.target.value)
					setGoal({...goal})
				}} 
			/>
		</div>

		<div className='flex-1'>
			<Button size='sm' onClick={handleSubmit}>Add</Button>
		</div>
	</div>
  )
}

//this is all very silly
const AttendanceGoalsColumnTransform: (organization) => JSX.Element = ({organization}) => {
	const [attendanceGoals, setAttendanceGoals] = useState<any[]>(organization.attendanceGoals.map(ag => ({
		...ag, 
		startDate: `${ag.startDate.year}-${ag.startDate.month.toString().padStart(2, '0')}-${ag.startDate.day.toString().padStart(2, '0')}`,
		endDate: `${ag.endDate.year}-${ag.endDate.month.toString().padStart(2, '0')}-${ag.endDate.day.toString().padStart(2, '0')}`
	})) || [])
	const [apiResult, setApiResult] = useState({ error: '', postSuccess: false, patchSuccess: false, deleteSuccess: false })

	function updateGoal(value) {
		const goal = attendanceGoals.find(x => x.guid == value.guid)
		goal.startDate = value.startDate
		goal.endDate = value.endDate
		goal.regularAttendees = value.regularAttendees

		setAttendanceGoals([...attendanceGoals])
	}

	async function postGoal(goal): Promise<any> {
		try {
			const result = await api.post(`organization/${organization.guid}/attendanceGoal`, goal)
			setApiResult({error: '', postSuccess: true, patchSuccess: false, deleteSuccess: false})
			
			goal.guid = result.data
			setAttendanceGoals([...attendanceGoals, goal])
		} 
		catch { 
			setApiResult({error: 'Failed to add new attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	async function patchGoal(goal) {
		try {
			await api.patch(`organization/${organization.guid}/attendanceGoal/${goal.guid}`, goal)
			setApiResult({error: '', postSuccess: false, patchSuccess: true, deleteSuccess: false})
		} 
		catch { 
			setApiResult({error: 'Failed to update attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	async function deleteGoal(goal) {
		try {
			await api.delete(`organization/${organization.guid}/attendanceGoal/${goal.guid}`)
			setApiResult({error: '', postSuccess: false, patchSuccess: false, deleteSuccess: true})
			setAttendanceGoals(attendanceGoals.filter(ag => ag.guid != goal.guid))
		} 
		catch { 
			setApiResult({error: 'Failed to delete attendance goal.', postSuccess: false, patchSuccess: false, deleteSuccess: false})
		}
	}

	const attendanceGoalRow: (goal) => JSX.Element = (goal) => {

		return (
			<div key={goal.guid} className='flex gap-2'>
				<div className='flex-[2]'>
					<input 
						className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
						type='date' 
						value={goal.startDate} 
						onChange={(e) => {
							goal.startDate = e.target.value
							updateGoal(goal)
						}} 
					/>
				</div>

				<div className='flex-[2]'>
					<input 
						className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
						type='date' 
						value={goal.endDate} 
						onChange={(e) => {
							goal.endDate = e.target.value
							updateGoal(goal)
						}} 
					/>
				</div>

				<div className='flex-1'>
					<input 
						className='w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
						type='number' 
						value={goal.regularAttendees} 
						onChange={(e) => {
							goal.regularAttendees = Number(e.target.value)
							updateGoal({...goal})
						}} 
					/>
				</div>

				<div className='flex-1'>
					<div className='flex gap-1'>
						<Button size='sm' variant='outline' onClick={() => patchGoal(goal)}>Update</Button>
						<Button variant='destructive' size='sm' onClick={() => deleteGoal(goal)}>Delete</Button>
					</div>
				</div>
			</div>
		)
	}

	const notification: () => JSX.Element = () => {
		if (apiResult.error.length > 0)
			return <div className='px-3 py-2 mb-2 text-red-700 bg-red-50 border border-red-200 rounded'>{apiResult.error}</div>
		else if (apiResult.patchSuccess)
			return <div className='px-3 py-2 mb-2 text-green-700 bg-green-50 border border-green-200 rounded'>Attendance Goal has been updated!</div>
		else if (apiResult.postSuccess)
			return <div className='px-3 py-2 mb-2 text-green-700 bg-green-50 border border-green-200 rounded'>Attendance Goal has been created!</div>
		else if (apiResult.deleteSuccess)
			return <div className='px-3 py-2 mb-2 text-green-700 bg-green-50 border border-green-200 rounded'>Attendance Goal has been deleted!</div>
		else
			return <></>
	}

	return ( 
		<div className='w-full flex flex-col justify-center py-3 space-y-2'>
			{notification()}
			{attendanceGoals.map(goal => attendanceGoalRow(goal))}
			<NewAttendanceGoalFormRow onSubmit={postGoal} />
		</div>
	)
}

const secondColumnOptions = [
	{ guid: 'orgYears', label: 'Organization Years'},
	{ guid: 'attendGoals', label: 'Attendance Goals'}
]

const createOrgColumns = (deleteOrg, secondColumnTransform, setSecondColumnTransform, additionalColumns): ColumnDef<any>[] => [
	{
		header: "Organization",
		accessorKey: 'name',
		filterFn: 'includesString',
		enableColumnFilter: true
	},
	{
		header: () => (
			<div className='w-full'>
				<Dropdown
					value={secondColumnTransform}
					options={secondColumnOptions}
					onChange={(value: string) => {
						setSecondColumnTransform(value)
					}}
				/>
				{secondColumnTransform != 'orgYears' && (
					<div className='flex items-end mt-2 text-xs text-gray-600'>
						<small className='flex-[2] pr-2'>Start Date</small>
						<small className='flex-[2] px-1'>End Date</small>
						<small className='flex-1 px-1'># Regular Attendees</small>
						<small className='flex-1'>Actions</small>
					</div>
				)}
			</div>
		),
		cell: ({ row }) => {
			const organization = row.original
			return secondColumnTransform == 'orgYears'
				? orgYearColumnTransform(organization, additionalColumns)
				: <AttendanceGoalsColumnTransform organization={organization} />
		},
		accessorKey: '',
		enableSorting: false,
		id: 'years'
	}
]

  /*
,
	{
	  label: "",
	  attributeKey: '',
	  transform: (organization) => {
		const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)
		const deletionConfirmationPhrase: JSX.Element = (
		  <span>
			the organization <span className='text-danger'>{organization.name}</span> including all years with their student, instructor, and attendance information
		  </span>
		)
  
		return (
		  <div className='d-flex justify-center'>
			<BButton variant="danger" onClick={() => setShowDeletionModal(true)}>
			  Delete
			</BButton>  
			{showDeletionModal ?
			  <ConfirmDeletionModal 
				showModal={showDeletionModal} 
				handleClose={() => setShowDeletionModal(false)} 
				confirmationPhrase={deletionConfirmationPhrase}
				deletionCallback={() => deleteOrg(organization.guid)} 
			  />
			  : null
			}
		  </div>
		)
	  },
	  sortable: false
	}
  */

  const ConfirmDeletionModal = ({showModal, handleClose, confirmationPhrase, deletionCallback}): React.ReactNode => {
	  const [show, setShow] = useState<boolean>(showModal)
  
	  const executeDeletion = () => {
		  deletionCallback()
		  handleClose()
	  }

	  useEffect(() => {
		setShow(showModal)
	  }, [showModal])
  
	  if (!show) return <></>
  
	  return (
		  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			  <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
				  <div className="flex justify-between items-center p-6 border-b border-gray-200">
					  <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
					  <button 
						  onClick={() => { setShow(false); handleClose(); }}
						  className="text-gray-400 hover:text-gray-600"
					  >
						  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						  </svg>
					  </button>
				  </div>
				  <div className="p-6">
					  <p className="text-gray-700">
						  Are you certain that you want to delete {confirmationPhrase}?
					  </p>
				  </div>
				  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
					  <Button variant='outline' onClick={() => { setShow(false); handleClose(); }}>No, Close</Button>
					  <Button variant='destructive' onClick={() => executeDeletion()}>Yes, Delete</Button>
				  </div>
			  </div>
		  </div>
	  )
  }