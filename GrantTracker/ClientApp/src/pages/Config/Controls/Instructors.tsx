import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from 'react-bootstrap'
import Table, { Column, SortDirection } from "components/BTable"
import { InstructorSchoolYearView } from 'Models/Instructor'
import { Quarter, Year } from 'Models/OrganizationYear'
import paths from 'utils/routing/paths'
import api from 'utils/api'

const createInstructorColumns = (onDeleteConfirmation): Column[] => [
	{
		label: 'Last Name',
		attributeKey: '',
		transform: (instructorSY: InstructorSchoolYearView) => (<a target='_blank' href={`${paths.Admin.path}/${paths.Admin.Tabs.Staff.path}/${instructorSY.guid}`}>{instructorSY.instructor.lastName}</a>),
		sortTransform: (instructorSY: InstructorSchoolYearView) => instructorSY.instructor.lastName,
		sortable: true
	},
	{
		label: 'First Name',
		attributeKey: 'instructor.firstName',
		sortable: true
	},
	{
		label: 'Org',
		attributeKey: 'organizationName',
		sortable: true
	},
	{
		label: 'Badge #',
		attributeKey: 'instructor.badgeNumber',
		sortable: true
	},
	{
		label: 'School Year',
		attributeKey: 'year.schoolYear',
		sortable: true
	},
	{
		label: 'Quarter',
		attributeKey: 'year.quarter',
		transform: (quarter: number) => Quarter[quarter],
		sortable: false
	},
	{
		label: '',
		attributeKey: '',
		transform: (isy: InstructorSchoolYearView) => (<div>
			<button type='button' className='btn btn-sm btn-danger' onClick={() => onDeleteConfirmation(isy)}>Delete</button>
		</div>),
		sortable: false
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
			<div className="d-flex flex-column align-items-center">
			  <Spinner animation='border' role='status' />
			  <small className='text-muted'>Loading Instructor...</small>
			</div>
		  );

	return (
		<div className=''>
			{
				hasError ? <h5 className='text-danger mb-3'>Something went wrong with your request.</h5> : null
			}
			{
				deletedInstructor ? <h5 className='text-success mb-3'>{deletedInstructor.instructor.firstName} {deletedInstructor.instructor.lastName} was deleted!</h5> : null
			}

			<h3>Pending Instructor Deletions</h3>
			<Table columns={createInstructorColumns((isy) => deleteInstructor(isy))} dataset={instructorOrgYears!} />
		</div>
	);
}