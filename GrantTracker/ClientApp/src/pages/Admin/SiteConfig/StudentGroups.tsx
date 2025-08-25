import { useContext, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Users, Plus, Trash2, UserPlus, Search } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from 'components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { HeaderCell } from '@/components/ui/table'

import { StudentGroup, StudentGroupStudent, StudentGroupInstructor, StudentGroupTableRow } from 'models/StudentGroup'
import { InstructorSchoolYearView } from "Models/Instructor"
import { OrgYearContext } from ".."
import api from "utils/api"
import SearchStudentsModal from "components/SessionDetails/SearchStudentsModal"


export const StudentGroupsConfig = (): JSX.Element => {
	const { orgYear, setOrgYear: _ } = useContext(OrgYearContext)
	const [activeGroupGuid, setActiveGroupGuid] = useState<string | undefined>('')

	const [groupInput, setGroupInput] = useState<string>('')
	const [groupAPIState, setGroupAPIState] = useState({
		isPending: false,
		hasError: false
	})

	const { isPending, data: studentGroups, refetch: fetchGroups } = useQuery<StudentGroup[]>({
		queryKey: [`organizationYear/${orgYear?.guid}/studentGroup?fields=name,students,instructors`],
		enabled: orgYear?.guid !== undefined
	})

	const { isPending: instructorsPending, data: instructors } = useQuery<InstructorSchoolYearView>({
		queryKey: [`instructor?orgYearGuid=${orgYear?.guid}`],
		enabled: !!orgYear?.guid
	})

	function createGroupAsync(name: string): void {
		setGroupAPIState({ isPending: true, hasError: false })
		api.post(`organizationYear/${orgYear.guid}/studentGroup?name=${name}`)
			.catch(err => {
				setGroupAPIState({ ...groupAPIState, hasError: true })
			})
			.finally(() => {
				setGroupAPIState({ ...groupAPIState, isPending: false })
				setGroupInput('')
				fetchGroups()
			})
	}

	const rowClick = (event, row: StudentGroup) => setActiveGroupGuid(row.groupGuid)

	if (isPending)
		return (
			<div className='flex justify-center py-8'>
				<Spinner variant="border" />
			</div>
		)

	return (
		<div className='flex flex-nowrap gap-3'>
			<div className={activeGroupGuid ? '' : "w-full"}>
				<div className='flex items-center gap-3 mb-6'>
					<h2 className='text-2xl font-bold'>Student Groups</h2>
					<Users className='h-6 w-6' />
				</div>

				{!activeGroupGuid && (
					<div className="flex items-end gap-4 mb-6">
						<div className="flex-1 max-w-xs">
							<label htmlFor='group-name' className='block text-sm font-medium mb-2'>Group Name</label>
							<input
								autoComplete='false'
								type='text'
								id='group-name'
								className='w-full px-3 py-2 border border-input rounded-md bg-background'
								value={groupInput}
								onChange={(e) => setGroupInput(e.target.value)}
							/>
						</div>

						<Button
							onClick={() => createGroupAsync(groupInput)}
							disabled={groupAPIState.isPending || !groupInput.trim()}
							className="flex items-center gap-2"
							variant="outline"
						>
							{groupAPIState.isPending ? (
								<Spinner variant="border" className="h-4 w-4" />
							) : (
								<>
									<Plus className="h-4 w-4" />
									<Users />
								</>
							)}
						</Button>
					</div>
				)}

				<div className={activeGroupGuid ? 'flex-shrink-0 w-80' : 'flex-1'}>
					<DataTable
						columns={activeGroupGuid ? [groupColumns[0]] : groupColumns}
						data={studentGroups || []}
						emptyMessage="No student groups found"
						initialSorting={[{ id: 'name', desc: false }]}
						onRowClick={(row) => setActiveGroupGuid(row.groupGuid)}
						containerClassName="w-full"
					/>
				</div>
			</div>

			<div className='flex-grow-1'>
				{activeGroupGuid && (
					<div className='flex-1 min-w-0'>
						<StudentGroupConfig groupGuid={activeGroupGuid} name={studentGroups?.find(g => g.groupGuid === activeGroupGuid)?.name || ''} instructors={instructors} setActiveGroupGuid={setActiveGroupGuid} />
					</div>
				)}
			</div>
		</div>
	)
}


enum APIAction {
	None = -1,
	Post = 0,
	Delete = 1
}

const StudentGroupConfig = ({ groupGuid, name, instructors, setActiveGroupGuid }: { groupGuid: string, name: string, instructors: InstructorSchoolYearView[] | undefined, setActiveGroupGuid: (guid: string) => void }): JSX.Element => {
	const { orgYear, setOrgYear: _ } = useContext(OrgYearContext)
	const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
	const [instructorAPIState, setInstructorAPIState] = useState({
		isPending: false,
		hasError: false,
		action: APIAction.None
	})
	const [studentAPIState, setStudentAPIState] = useState({
		studentSchoolYearGuid: '',
		hasError: false
	})

	const { isPending, data: group, refetch: fetchGroup, isError } = useQuery<StudentGroup>({
		queryKey: [`organizationYear/${orgYear?.guid}/studentGroup/${groupGuid}`],
		enabled: !!orgYear?.guid && !!groupGuid
	})

	function addInstructorAsync(instructorSchoolYearGuid: string): void {
		if (!instructorSchoolYearGuid || instructorSchoolYearGuid == '')
			return;

		setInstructorAPIState({ isPending: true, hasError: false, action: APIAction.Post })
		api.post(`instructorSchoolYear/${instructorSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => {
				setInstructorAPIState(state => ({ ...state, hasError: true }))
			})
			.finally(() => {
				setInstructorAPIState(state => ({ ...state, isPending: false }))
				fetchGroup()
			})
	}

	function removeInstructorAsync(instructorSchoolYearGuid: string): void {
		setInstructorAPIState({ isPending: true, hasError: false, action: APIAction.Delete })
		api.delete(`instructorSchoolYear/${instructorSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => {
				setInstructorAPIState({ ...instructorAPIState, hasError: true })
			})
			.finally(() => {
				setInstructorAPIState({ ...instructorAPIState, isPending: false })
				fetchGroup()
			})
	}

	function addStudentAsync(studentSchoolYearGuid: string): Promise<any> {
		setStudentAPIState({ studentSchoolYearGuid: '', hasError: false })
		return api.post(`studentSchoolYear/${studentSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => {
				setStudentAPIState({ studentSchoolYearGuid, hasError: true })
			})
			.finally(() => {
				fetchGroup()
			})
	}

	function removeStudentAsync(studentSchoolYearGuid: string): void {
		api.delete(`studentSchoolYear/${studentSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => { })
			.finally(() => {
				fetchGroup()
			})
	}

	if (isError)
		return <div className='text-destructive p-3 bg-destructive/10 rounded-md'>Unable to fetch student group.</div>

	const [selectedInstructorGuid, setSelectedInstructorGuid] = useState<string>('')

	const studentColumns: ColumnDef<StudentGroupStudent, any>[] = createStudentColumns(removeStudentAsync)
	const instructorColumns: ColumnDef<StudentGroupInstructor, any>[] = createInstructorColumns(removeInstructorAsync)

	const errorStudent: StudentGroupStudent | undefined = group?.students.find(stu => stu.studentSchoolYearGuid == studentAPIState.studentSchoolYearGuid)

	return (
		<div className="space-y-6 my-3">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-semibold">{name} Details</h3>

				<Button
					variant="outline"
					onClick={() => setActiveGroupGuid('')}
					className="flex items-center gap-2"
				>
					Close
				</Button>
			</div>

			<div className="space-y-2">
				<div className='flex items-end justify-between gap-3'>
					<div>
						<Button
							onClick={() => setShowStudentModal(true)}
							className="flex items-center gap-2"
							variant="outline"
						>
							<UserPlus className="h-4 w-4" />
							Add Students
						</Button>
						{errorStudent && (
							<div className='text-destructive text-sm p-2 bg-destructive/10 rounded-md'>
								Unable to add {errorStudent.firstName} {errorStudent.lastName}.
							</div>
						)}
					</div>

					<div>
						<div className='flex gap-1'>
							<Select
								value={selectedInstructorGuid}
								onValueChange={setSelectedInstructorGuid}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select an instructor" />
								</SelectTrigger>
								<SelectContent>
									{instructors?.map(instructor => (
										<SelectItem key={instructor.guid} value={instructor.guid}>
											{`${instructor.instructor.firstName} ${instructor.instructor.lastName}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>


							<Button
								onClick={() => {
									addInstructorAsync(selectedInstructorGuid)
									setSelectedInstructorGuid('')
								}}
								disabled={instructorAPIState.isPending || !selectedInstructorGuid}
								className="flex items-center gap-2"
								variant="outline"
							>
								{instructorAPIState.isPending ? (
									<Spinner variant="border" className="h-4 w-4" />
								) : (
									<Plus className="h-4 w-4" />
								)}
								Attach
							</Button>
						</div>

						{instructorAPIState.hasError && (
							<div className='text-destructive text-sm p-2 bg-destructive/10 rounded-md'>
								Unable to add instructor.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Students Table */}
			<div>
				<h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
					<Users className="h-5 w-5" />
					Students
				</h4>
				<DataTable
					columns={studentColumns}
					data={group?.students || []}
					emptyMessage="No students in this group"
					initialSorting={[{ id: 'lastName', desc: false }]}
					containerClassName="w-full"
				/>
			</div>

			{/* Instructors Table */}
			<div>
				<h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
					<UserPlus className="h-5 w-5" />
					Instructors
				</h4>
				<DataTable
					columns={instructorColumns}
					data={group?.instructors || []}
					emptyMessage="No instructors assigned to this group"
					initialSorting={[{ id: 'lastName', desc: false }]}
					containerClassName="w-full"
				/>
			</div>

			<SearchStudentsModal
				orgYearGuid={orgYear.guid}
				show={showStudentModal}
				handleClose={() => setShowStudentModal(false)}
				handleChange={({ student }) => addStudentAsync(student.guid)}
			/>
		</div>
	)
}


const groupColumns: ColumnDef<StudentGroup, any>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<HeaderCell
				label="Name"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		id: 'name'
	},
	{
		accessorKey: 'students',
		header: ({ column }) => (
			<HeaderCell
				label="# of Students"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		cell: ({ row }) => (
			<span className="font-medium">
				{row.original.students?.length || 0}
			</span>
		),
		id: 'studentCount'
	},
	{
		accessorKey: 'instructors',
		header: () => <HeaderCell label="Instructors" />,
		cell: ({ row }) => (
			<div className='flex flex-col space-y-1'>
				{row.original.instructors?.map((instructor, idx) => (
					<span key={idx} className="text-sm">
						{`${instructor.firstName} ${instructor.lastName}`}
					</span>
				))}
				{(!row.original.instructors || row.original.instructors.length === 0) && (
					<span className="text-sm text-muted-foreground italic">No instructors assigned</span>
				)}
			</div>
		),
		enableSorting: false,
		id: 'instructors'
	}
]

const createStudentColumns = (removeStudentAsync): ColumnDef<StudentGroupStudent, any>[] => [
	{
		accessorKey: 'firstName',
		header: ({ column }) => (
			<HeaderCell
				label="First Name"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		id: 'firstName'
	},
	{
		accessorKey: 'lastName',
		header: ({ column }) => (
			<HeaderCell
				label="Last Name"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		id: 'lastName'
	},
	{
		header: "Actions",
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Button
					variant="destructive"
					size="sm"
					className="flex items-center gap-2"
					onClick={() => removeStudentAsync(row.original.studentSchoolYearGuid)}
					aria-label="Remove instructor from student group"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		),
		enableSorting: false,
		id: 'actions'
	}
]

const createInstructorColumns = (removeInstructorAsync): ColumnDef<StudentGroupInstructor, any>[] => [
	{
		accessorKey: 'firstName',
		header: ({ column }) => (
			<HeaderCell
				label="First Name"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		id: 'firstName'
	},
	{
		accessorKey: 'lastName',
		header: ({ column }) => (
			<HeaderCell
				label="Last Name"
				sort={column.getIsSorted()}
				onSortClick={() => column.toggleSorting()}
			/>
		),
		id: 'lastName'
	},
	{
		header: "Actions",
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Button
					variant="destructive"
					size="sm"
					className="flex items-center gap-2"
					onClick={() => removeInstructorAsync(row.original.instructorSchoolYearGuid)}
				>
					<Trash2 className="h-4 w-4" />
					Remove
				</Button>
			</div>
		),
		enableSorting: false,
		id: 'actions'
	}
]