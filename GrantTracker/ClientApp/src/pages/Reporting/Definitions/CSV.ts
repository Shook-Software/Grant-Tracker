import { DateTimeFormatter } from "@js-joda/core"
import { Locale } from "@js-joda/locale_en-us"
import { DateOnly } from "Models/DateOnly"
import { TimeOnly } from "Models/TimeOnly"

export const studentAttendanceFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
	{
		label: 'Matric Number',
		value: 'matricNumber'
	},
	{
		label: 'Grade',
		value: 'grade',
	},
	{
		label: 'Total Days',
		value: 'totalDays'
	},
	{
		label: 'Total Hours',
		value: 'totalHours'
	},
]

export const familyAttendanceFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
	{
		label: 'Matric Number',
		value: 'matricNumber'
	},
	{
		label: 'Grade',
		value: 'grade',
	},
	{
		label: 'Family Member',
		value: 'familyMember'
	},
	{
		label: 'Total Days',
		value: 'totalDays'
	},
	{
		label: 'Total Hours',
		value: 'totalHours'
	}
]

export const flattenFamilyAttendance = (data) => {
	if (!data)
		return []
	
	let flattenedData: any[] = []

	data.forEach(x => {
		flattenedData = [
			...flattenedData,
			...x.familyAttendance.map(fa => ({
				organizationName: x.organizationName,
				firstName: x.firstName,
				lastName: x.lastName,
				grade: x.grade,
				matricNumber: x.matricNumber,
				familyMember: fa.familyMember,
				totalDays: fa.totalDays,
				totalHours: fa.totalHours
			}))
		]
	})

	return flattenedData
}

export const activityFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Activity Type',
		value: 'activity'
	},
	{
		label: 'Total Attendees',
		value: 'totalAttendees'
	},
	{
		label: 'Total Hours',
		value: 'totalHours',
	}
]

export const siteSessionFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Name',
		value: 'sessionName'
	},
	{
		label: 'Activity Type',
		value: 'activityType'
	},
	{
		label: 'Objective',
		value: 'objective'
	},
	{
		label: 'Funding Source',
		value: 'fundingSource'
	},
	{
		label: 'Partnership Type',
		value: 'partnershipType'
	},
	{
		label: 'Organization Type',
		value: 'organizationType'
	},
	{
		label: 'Instructor Last Name',
		value: 'instructorLastName'
	},
	{
		label: 'Instructor First Name',
		value: 'instructorFirstName'
	},
	{
		label: 'Instructor Status',
		value: 'instructorStatus'
	},
	{
		label: 'Grades',
		value: 'grades'
	},
	{
		label: 'Number of Participants',
		value: 'attendeeCount'
	},
]


export const flattenSiteSessions = (data) => {
	if (!data)
		return []

	let flattenedData: any[] = []

	data.forEach(session => {
		if (session.instructors.length !== 0) {
			session.instructors.forEach(i => {
				flattenedData = [
					...flattenedData,
					{
						organizationName: session.organizationName,
						sessionName: session.sessionName,
						activityType: session.activityType,
						sessionType: session.sessionType,
						objective: session.objective,
						fundingSource: session.fundingSource,
						partnershipType: session.partnershipType,
						organizationType: session.organizationType,
						instructorLastName: i.lastName,
						instructorFirstName: i.firstName,
						instructorStatus: i.status,
						instanceDate: DateOnly.toLocalDate(session.instanceDate).toString(),
						//endDate: DateOnly.toLocalDate(session.endDate).toString(),
						grades: session.grades == '{}' || session.grades == '{ }' ? 'N/A' : session.grades.substring(1, session.grades.length - 1),
						attendeeCount: session.attendeeCount
					}
				]
			})
		}
		else {
			flattenedData = [
				...flattenedData,
				{
					organizationName: session.organizationName,
					sessionName: session.sessionName,
					activityType: session.activityType,
					sessionType: session.sessionType,
					objective: session.objective,
					fundingSource: session.fundingSource,
					partnershipType: session.partnershipType,
					organizationType: session.organizationType,
					instructorLastName: '',
					instructorFirstName: '',
					instructorStatus: '',
					instanceDate: DateOnly.toLocalDate(session.instanceDate).toString(),
					//endDate: DateOnly.toLocalDate(session.endDate).toString(),
					grades: session.grades == '{}' || session.grades == '{ }' ? 'N/A' : session.grades.substring(1, session.grades.length - 1),
					attendeeCount: session.attendeeCount
				}
			]
		}
	})

	return flattenedData
}


export const summaryOfClassesFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Session Name',
		value: 'sessionName'
	},
	{
		label: 'Activity Type',
		value: 'activityType'
	},
	{
		label: 'Funding Source',
		value: 'fundingSource'
	},
	{
		label: 'Instructor Last Name',
		value: 'instructorLastName'
	},
	{
		label: 'Instructor First Name',
		value: 'instructorFirstName'
	},
	{
		label: 'Instructor Status',
		value: 'instructorStatus'
	},
	{
		label: 'Start Date',
		value: 'startDate'
	},
	{
		label: 'End Date',
		value: 'endDate'
	},
	{
		label: 'Weeks to Date',
		value: 'weeksToDate'
	},
	{
		label: 'Average Daily Attendance',
		value: 'avgDailyAttendance'
	},
	{
		label: 'Average Hours per Day',
		value: 'avgHoursPerDay'
	}
]

export const flattenSummaryOfClasses = (data) => {
	if (!data)
		return []

	let flattenedData: any[] = []

	data.forEach(session => {
		if (session.instructors.length !== 0) {
			session.instructors.forEach(i => {
				flattenedData = [
					...flattenedData,
					{
						organizationName: session.organizationName,
						sessionName: session.sessionName,
						activityType: session.activityType,
						fundingSource: session.fundingSource,
						instructorLastName: i.lastName,
						instructorFirstName: i.firstName,
						instructorStatus: i.status,
						startDate: DateOnly.toLocalDate(session.firstSession).toString(),
						endDate: DateOnly.toLocalDate(session.lastSession).toString(),
						weeksToDate: session.weeksToDate,
						//daysOfWeek: session.daysOfWeek.map(day => `${DayOfWeek.toChar(day)}`).toString(),
						avgDailyAttendance: session.avgDailyAttendance,
						avgHoursPerDay: session.avgHoursPerDay
					}
				]
			})
		}
		else {
			flattenedData = [
				...flattenedData,
				{
					organizationName: session.organizationName,
					sessionName: session.sessionName,
					activityType: session.activityType,
					fundingSource: session.fundingSource,
					instructorLastName: '',
					instructorFirstName: '',
					instructorStatus: '',
					startDate: DateOnly.toLocalDate(session.firstSession).toString(),
					endDate: DateOnly.toLocalDate(session.lastSession).toString(),
					weeksToDate: session.weeksToDate,
					//daysOfWeek: session.daysOfWeek.map(day => `${DayOfWeek.toChar(day)}`).toString(),
					avgDailyAttendance: session.avgDailyAttendance,
					avgHoursPerDay: session.avgHoursPerDay
				}
			]
		}

	})

	return flattenedData
}


export const programOverviewFields = [
	{
		label: 'Organization Name',
		value: 'organizationName'
	},
	{
		label: '# of Regular Students',
		value: 'regularStudentCount'
	},
	{
		label: '# of Family Attendees',
		value: 'familyAttendanceCount',
	},
	{
		label: 'Student Days Offered',
		value: 'studentDaysOfferedCount'
	},
	{
		label: 'Avg Daily Unique Student Attendance',
		value: 'avgStudentDailyAttendance'
	},
	{
		label: 'Avg Student Attendance Days Per Week',
		value: 'avgStudentAttendDaysPerWeek'
	},
	{
		label: 'Avg Student Attendance Hours Per Week',
		value: 'avgStudentAttendHoursPerWeek'
	}
]


export const staffingFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Status',
		value: 'status'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	}
]

export const flattenStaffing = (data) => {
	if (!data)
		return []
	
	let flattenedData: any[] = []

	data.forEach(statusGroup => {
		flattenedData = [
			...flattenedData,
			...statusGroup.instructors.map(i => ({
				organizationName: i.organizationName,
				status: statusGroup.status,
				firstName: i.firstName,
				lastName: i.lastName
			}))
		]
	})

	return flattenedData
}


export const studentSurveyFields = [
	{
		label: 'Organization',
		value: 'organizationName'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
	{
		label: 'Matric Number',
		value: 'matricNumber'
	},
	{
		label: 'Grade',
		value: 'grade',
	},
	{
		label: 'Objective',
		value: 'objective'
	},
	{
		label: 'Total Days',
		value: 'totalDays'
	},
	{
		label: 'Total Hours',
		value: 'totalHours'
	}
]


export const attendanceCheckFields = [
	{
		label: 'Organization',
		value: 'school'
	},
	{
		label: 'Class',
		value: 'className'
	},
	{
		label: 'Weekday',
		value: 'weekday'
	},
	{
		label: 'Date',
		value: 'date'
	},
	{
		label: 'Start Times',
		value: 'startTimes'
	},
	{
		label: 'End Times',
		value: 'endTimes'
	},
	{
		label: 'Instructors',
		value: 'instructors'
	},
	{
		label: 'Entry',
		value: 'attendanceEntry'
	}
]

export const flattenAttendanceCheck = (data) => {
	if (!data)
		return []
	
	let flattenedResults: any[] = data.map(x => {

		const timeBounds = x.timeBounds
		
		return {
			school: x.school,
			className: x.className,
			weekday: x.instanceDate.format(DateTimeFormatter.ofPattern('eeee').withLocale(Locale.ENGLISH)),
			date: x.instanceDate.toString(),
			startTimes: timeBounds.map(y => y.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))),
			endTimes: timeBounds.map(y => y.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH))),
			instructors: x.instructors.map(y => `${y.firstName} ${y.lastName}`),
			attendanceEntry: x.attendanceEntry
		}
	})

	return flattenedResults
}

export const cclc10Fields = [
	{
		label: 'School',
		value: 'school'
	},
	{
		label: 'Matric Number',
		value: 'matricNumber'
	},
	{
		label: 'Last Name',
		value: 'lastName'
	},
	{
		label: 'First Name',
		value: 'firstName'
	},
	{
		label: 'Session',
		value: 'session'
	},
	{
		label: 'Date',
		value: 'date'
	},
	{
		label: 'Start Time',
		value: 'startTime'
	},
	{
		label: 'End Time',
		value: 'endTime'
	},
	{
		label: 'Activity',
		value: 'activity'
	},
]

export const payrollAuditFields = [
	{
		label: 'School',
		value: 'school',
	},
	{
		label: 'Class',
		value: 'className',
	},
	{
		label: 'Total Attendees',
		value: 'totalAttendees',
	},
	{
		label: 'Date',
		value: 'instanceDate',
	},
	{
		label: 'Start Time',
		value: 'startTime',
	},
	{
		label: 'End Time',
		value: 'endTime',
	},
	{
		label: 'Total Time (h:mm)',
		value: 'totalTime',
	},
	{
		label: 'Activity Type',
		value: 'activity',
	},
	{
		label: 'Registered Instructor Last Name',
		value: 'registeredInstructorLastName',
	},
	{
		label: 'Registered Instructor First Name',
		value: 'registeredInstructorFirstName',
	},
	{
		label: 'Attending Instructor Last Name',
		value: 'attendingInstructorLastName',
	},
	{
		label: 'Attending Instructor First Name',
		value: 'attendingInstructorFirstName',
	},
	{
		label: 'Substitute?',
		value: 'isSubstitute',
	},
]


export const flattenPayrollReport = (data) => {
	if (!data)
		return []
	
	let flattenedResults: any[] = []
	
	data.forEach(x => {

		let recordsToAdd: any[] = []
		
		x.registeredInstructors.forEach(ri => {

			const instructorAttendance = x.attendingInstructorRecords.find(air => air.firstName == ri.firstName && air.lastName == ri.lastName)
			
			recordsToAdd = instructorAttendance 
				? [...recordsToAdd, ...instructorAttendance.timeRecords.map(tr => ({
					school: x.school,
					className: x.className,
					totalAttendees: x.totalAttendees,
					activity: x.activity,
					instanceDate: x.instanceDate.toString(),
					startTime: tr.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)),
					endTime: tr.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)),
					totalTime: tr.totalTime,
					registeredInstructorLastName: ri.lastName,
					registeredInstructorFirstName: ri.firstName,
					attendingInstructorLastName: instructorAttendance.lastName,
					attendingInstructorFirstName: instructorAttendance.firstName,
					isSubstitute: 'N'
				}))]
				: [...recordsToAdd, {
					school: x.school,
					className: x.className,
					totalAttendees: x.totalAttendees,
					activity: x.activity,
					instanceDate: x.instanceDate.toString(),
					startTime: '',
					endTime: '',
					totalTime: 0,
					registeredInstructorLastName: ri.lastName,
					registeredInstructorFirstName: ri.firstName,
					attendingInstructorLastName: '',
					attendingInstructorFirstName: '',
					isSubstitute: 'N'
				}]
		})
		
		x.attendingInstructorRecords.filter(air => air.isSubstitute).forEach(air => {
			recordsToAdd = [...recordsToAdd, 
				...air.timeRecords.map(tr => ({
					school: x.school,
					className: x.className,
					totalAttendees: x.totalAttendees,
					activity: x.activity,
					instanceDate: x.instanceDate.toString(),
					startTime: tr.startTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)),
					endTime: tr.endTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.ENGLISH)),
					totalTime: tr.totalTime,
					registeredInstructorLastName: '',
					registeredInstructorFirstName: '',
					attendingInstructorLastName: air.lastName,
					attendingInstructorFirstName: air.firstName,
					isSubstitute: 'Y'
				}))
			]
		})

		flattenedResults = [...flattenedResults, ...recordsToAdd]
	})

	return flattenedResults
}

export const scheduleFields = [
	{
		label: 'Class Name',
		value: 'className',
	},
	{
		label: 'Activity',
		value: 'activity',
	},
	{
		label: 'Objective',
		value: 'objective',
	},
	{
		label: 'Session Type',
		value: 'sessionType',
	},
	{
		label: 'Day of Week',
		value: 'dayOfWeek',
	},
	{
		label: 'Start Time',
		value: 'startTime',
	},
	{
		label: 'End Time',
		value: 'endTime',
	},
	{
		label: 'Start Date',
		value: 'startDate',
	},
	{
		label: 'End Date',
		value: 'endDate',
	},
	{
		label: 'First Name',
		value: 'firstName',
	},
	{
		label: 'Last Name',
		value: 'lastName',
	},
]
