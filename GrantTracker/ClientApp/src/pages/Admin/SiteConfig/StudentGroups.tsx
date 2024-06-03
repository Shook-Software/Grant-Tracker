import { useContext, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Col, Container, Row, Spinner } from "react-bootstrap"
import Select from 'react-select'

import { StudentGroup, StudentGroupStudent, StudentGroupInstructor, StudentGroupTableRow } from 'models/StudentGroup'
import { InstructorSchoolYearView } from "Models/Instructor"
import { OrgYearContext } from ".."
import Table, { Column, SortDirection } from "components/BTable"
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
				setGroupAPIState({ ...groupAPIState, hasError: true })})
			.finally(() => {
				setGroupAPIState({ ...groupAPIState, isPending: false })
				setGroupInput('')
				fetchGroups()
			})
	}
	
    const rowClick =  (event, row: StudentGroup) => setActiveGroupGuid(row.groupGuid)

	if (isPending)
		return <div className='d-flex justify-content-center'><Spinner /></div>

	return (
		<div className='mt-3'>
			<Row style={activeGroupGuid ? {display: 'none'} : {}}>
				<Container>
					<Row>
						<Col>
							<label htmlFor='group-name' className='form-label'>Name</label>
							<input autoComplete='false' type='text' id='group-name' className='form-control' value={groupInput} onChange={(e) => setGroupInput(e.target.value)} />
						</Col>

						<Col className='d-flex align-items-end'>
							<button type='button' className='btn btn-primary' onClick={() => createGroupAsync(groupInput)}>Create</button>
						</Col>
					</Row>
				</Container>
			</Row>

			<Row className='mt-3'>
				<Col sm={activeGroupGuid ? 3 : 12}>
					<Table 
						columns={activeGroupGuid ? [groupColumns[0]] : groupColumns}
						dataset={studentGroups || []}
						defaultSort={{index: 1, direction: SortDirection.Ascending}}
						rowProps={{key: 'studentSchoolYearGuid', onClick: rowClick}} 
					/>
				</Col>
				<Col sm={activeGroupGuid ? 9 : 0}>
					{activeGroupGuid && <StudentGroupConfig groupGuid={activeGroupGuid} instructors={instructors} />}
				</Col>
			</Row>
		</div>
	)
}


enum APIAction {
	None = -1,
	Post = 0,
	Delete = 1
}

const StudentGroupConfig = ({ groupGuid, instructors }: { groupGuid: string, instructors: InstructorSchoolYearView[] | undefined }): JSX.Element => {
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
				setInstructorAPIState({ ...instructorAPIState, hasError: true })})
			.finally(() => {
				setInstructorAPIState({ ...instructorAPIState, isPending: false })
				fetchGroup()
			})
	}

	function addStudentAsync(studentSchoolYearGuid: string): Promise<any> {
		setStudentAPIState({ studentSchoolYearGuid: '', hasError: false })
		return api.post(`studentSchoolYear/${studentSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => {
				setStudentAPIState({ studentSchoolYearGuid, hasError: true })})
			.finally(() => {
				fetchGroup()
			})
	}

	function removeStudentAsync(studentSchoolYearGuid: string): void {
		api.delete(`studentSchoolYear/${studentSchoolYearGuid}/studentGroup/${groupGuid}`)
			.catch(err => {})
			.finally(() => {
				fetchGroup()
			})
	}

	if (isError)
		return <div className='text-danger'>Unable to fetch student group.</div>

	const studentColumns: Column[] = createStudentColumns(removeStudentAsync)
	const instructorColums: Column[] = createInstructorColumns(removeInstructorAsync)

	const errorStudent: StudentGroupStudent | undefined = group?.students.find(stu => stu.studentSchoolYearGuid == studentAPIState.studentSchoolYearGuid)

	return (
		<div>
			<Row>
				<Col sm={3}>
					<button type='button' className='btn btn-primary' onClick={() => setShowStudentModal(true)}>Add Students</button>
					{ errorStudent ? <small className='text-danger'>Unable to add {errorStudent.firstName} {errorStudent.lastName}.</small> : null}
				</Col>
			</Row>

			<Row className='mt-1'>
				<Col sm={12}>
					<form onSubmit={(e => {e.preventDefault(); addInstructorAsync(e.target[1].value)})}>
						<div className='input-group'>
							<Select 
								name='instructor'
								className='form-control p-0'
								options={instructors?.map(option => ({label: `${option.instructor.firstName} ${option.instructor.lastName}`, value: option.guid}) || [])}
							/>
							<button type='submit' className='btn btn-primary' disabled={instructorAPIState.isPending} style={{maxHeight: '40px'}}>{ instructorAPIState.isPending ? <Spinner /> : 'Attach Instructor'}</button>
						</div>
						{ instructorAPIState.hasError ? <small className='text-danger'>Unable to add instructor.</small> : null}
					</form>
				</Col>
			</Row>

			<Row className='mt-1'>
				<h6>Students</h6>
				<Table 
					columns={studentColumns}
					dataset={group?.students || []}
					defaultSort={{index: 1, direction: SortDirection.Ascending}}
				/>
			</Row>

			<Row>
				<h6>Instructors</h6>
				<Table 
					columns={instructorColums}
					dataset={group?.instructors || []}
					defaultSort={{index: 1, direction: SortDirection.Ascending}}
				/>
			</Row>

			<Row>
				<SearchStudentsModal
					orgYearGuid={orgYear.guid}
					show={showStudentModal}
					handleClose={() => setShowStudentModal(false)}
					handleChange={({student}) => addStudentAsync(student.guid)}
				/>
			</Row>
		</div>
	)
}


const groupColumns /*= (setActiveGroup)*/: Column[] = [
	{
		label: 'Name',
		attributeKey: 'name',
		sortable: true
	},
	{
		label: '# of Students',
		attributeKey: 'students',
		sortable: true,
		transform: (students: StudentGroupStudent[]) => students?.length
	},
	{
		label: 'Attached Instructors',
		attributeKey: 'instructors',
		sortable: false,
		transform: (instructors: StudentGroupInstructor[]) => <div className='d-flex flex-column'>
			{instructors.map((instructor, idx) => (<>
				<span>{`${instructor.firstName} ${instructor.lastName}`}</span>
				{idx == instructors.length - 1 ? null : <hr className='m-0' />}
			</>))}
		</div>
	}/*
	{
		label: '',
		attributeKey: 'groupGuid',
		sortable: false,
		transform: (groupGuid: string) => <div>
			<button type='button' className='btn btn-primary btn-sm' onClick={() => setActiveGroup(groupGuid)}>View</button>
		</div>
	},*/
]

const createStudentColumns = (removeStudentAsync): Column[] => [
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
		label: 'Actions',
		attributeKey: '',
		sortable: false,
		transform: (student: StudentGroupStudent) => <div className='d-flex'>
			<button type='button' className='btn btn-sm btn-danger' onClick={() => removeStudentAsync(student.studentSchoolYearGuid)}>Remove</button>
		</div>
	}
]

const createInstructorColumns = (removeInstructorAsync): Column[] => [
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
		label: 'Actions',
		attributeKey: '',
		sortable: false,
		transform: (student: StudentGroupInstructor) => <div className='d-flex'>
			<button type='button' className='btn btn-sm btn-danger' onClick={() => removeInstructorAsync(student.instructorSchoolYearGuid)}>Remove</button>
		</div>
	}
]