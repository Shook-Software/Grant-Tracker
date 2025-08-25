import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from 'components/DataTable'
import { Button } from 'components/ui/button'
import { InstructorSchoolYearView } from 'Models/Instructor'
import { Quarter, Year } from 'Models/OrganizationYear'
import paths from 'utils/routing/paths'
import api from 'utils/api'
import { ColumnDef } from '@tanstack/react-table'

const createInstructorColumns = (onDeleteConfirmation): ColumnDef<InstructorSchoolYearView>[] => [
	{
		header: 'Last Name',
		accessorKey: 'instructor.lastName',
		cell: ({ row }) => {
			const instructorSY = row.original
			return (
				<a 
					target='_blank' 
					href={`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}/${instructorSY.guid}`}
					className='text-blue-600 hover:text-blue-800 underline'
				>
					{instructorSY.instructor.lastName}
				</a>
			)
		}
	},
	{
		header: 'First Name',
		accessorKey: 'instructor.firstName'
	},
	{
		header: 'Org',
		accessorKey: 'organizationName'
	},
	{
		header: 'Badge #',
		accessorKey: 'instructor.badgeNumber'
	},
	{
		header: 'School Year',
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
			const isy = row.original
			return (
				<Button 
					variant='destructive' 
					size='sm' 
					onClick={() => onDeleteConfirmation(isy)}
				>
					Delete
				</Button>
			)
		},
		enableSorting: false
	}
]


export default (): JSX.Element => {
	const { isPending, data: instructorOrgYears, error: fetchError, refetch: refetchInstructorOrgYears } = useQuery<InstructorSchoolYearView[]>({
		queryKey: ['developer/instructors'],
		staleTime: 0,
		placeholderData: []
	})

	const [hasError, setHasError] = useState<boolean>(false);
	const [deletedInstructor, setDeletedInstructor] = useState<InstructorSchoolYearView | null>(null);

	async function deleteInstructor(isy: InstructorSchoolYearView): Promise<void> {
		setHasError(false)
		setDeletedInstructor(null)

		api.delete(`developer/instructor/${isy.guid}`)
			.then(res => {
				setDeletedInstructor(isy)
				refetchInstructorOrgYears()
			})
			.catch(err => setHasError(true))
	}

	if (isPending)
		return (
			<div className="flex flex-col items-center justify-center h-40 gap-3">
			  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			  <small className='text-gray-500'>Loading Instructors...</small>
			</div>
		  );

	return (
		<div className='space-y-4'>
			{hasError && (
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
					<h5 className='font-medium'>Something went wrong with your request.</h5>
				</div>
			)}
			{deletedInstructor && (
				<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded'>
					<h5 className='font-medium'>
						{deletedInstructor.instructor.firstName} {deletedInstructor.instructor.lastName} was deleted!
					</h5>
				</div>
			)}

			<div>
				<h3 className='text-xl font-semibold mb-4'>Pending Instructor Deletions</h3>
				<DataTable 
					columns={createInstructorColumns((isy) => deleteInstructor(isy))} 
					data={instructorOrgYears || []} 
					emptyMessage="No instructors pending deletion."
					className="hover:bg-gray-50"
					containerClassName="w-full"
				/>
			</div>
		</div>
	);
}