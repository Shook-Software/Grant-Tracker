
export interface StudentGroupInstructor {
	firstName: string,
	lastName: string,
	badgeNumber: string,
	instructorSchoolYearGuid: string
}

export interface StudentGroupStudent {
	firstName: string,
	lastName: string,
	matricNumber: string,
	studentSchoolYearGuid: string
}

export interface StudentGroup {
	groupGuid: string
	name: string
	students: StudentGroupStudent[]
	instructors: StudentGroupInstructor[]
}

export interface StudentGroupTableRow {
	groupGuid: string
	studentCount: number
}