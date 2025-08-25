import { useEffect, useReducer, useState } from 'react'

import ReportParameterInput, { ReportParameters } from './ReportParameters'

import StudentAttendanceReport from './Reports/StudentAttendanceReport'
import FamilyAttendanceReport from './Reports/FamilyAttendanceReport'
import ActivityReport from './Reports/ActivityReport'
import SiteSessionsReport from './Reports/SiteSessionsReport'
import AttendanceCheckReport from './Reports/AttendanceCheckReport'
import PayrollAuditReport from './Reports/PayrollAuditReport'
import ProgramOverviewReport from './Reports/ProgramOverviewReport'
import StudentSurveyReport from './Reports/StudentSurveyReport'
import SummaryOfClassesReport from './Reports/SummaryOfClassesReport'
import StaffingReport from './Reports/StaffingReport'
import CCLC10Report from './Reports/CCLC10Report'
import ScheduleReport from './Reports/ScheduleReport'
import AllStaffReport from './Reports/StaffMemberReport'

import { IdentityClaim } from 'utils/authentication'

type ReducerAction = 
| { type: 'activity', payload: number }
	| { type: 'attendanceCheck', payload: number }
	| { type: 'family', payload: number }
	| { type: 'payroll', payload: number }
	| { type: 'program', payload: number }
	| { type: 'site', payload: number }
	| { type: 'staff', payload: number }
	| { type: 'studentAttendance', payload: number }
	| { type: 'studentSurvey', payload: number }
	| { type: 'classes', payload: number }

function reducer (state, action: ReducerAction) {

	switch (action.type) {
		case 'activity':
		  	return { ...state, activity: action.payload }

		case 'attendanceCheck':
			return { ...state, attendanceCheck: action.payload }

		case 'family':
			return { ...state, family: action.payload }

		case 'site':
			return { ...state, site: action.payload }

		case 'payroll':
			return { ...state, payroll: action.payload }

		case 'program':
			return { ...state, program: action.payload }

		case 'staff':
			return { ...state, staff: action.payload }

		case 'studentAttendance':
			return { ...state, studentAttendance: action.payload }

		case 'studentSurvey':
			return { ...state, studentSurvey: action.payload }

		case 'classes':
			return { ...state, classes: action.payload }

		default: 
			return { ...state }
	}
}

const tabs = [
  { key: 'student-attendance', label: 'Student Attendance', countKey: 'studentAttendance' },
  { key: 'family-attendance', label: 'Family Attendance', countKey: 'family' },
  { key: 'activities', label: 'Activities', countKey: 'activity' },
  { key: 'site-sessions', label: 'Site Sessions', countKey: 'site' },
  { key: 'summary-of-classes', label: 'Summary of Classes', countKey: 'classes' },
  { key: 'program-overview', label: 'Program Overview', countKey: 'program' },
  { key: 'staffing', label: 'Staffing', countKey: 'staff' },
  { key: 'student-survey', label: 'Student Surveys', countKey: 'studentSurvey' },
  { key: 'attendance-check', label: 'Attendance Check', countKey: 'attendanceCheck' },
  { key: 'payroll-audit', label: 'Payroll Audit' },
  { key: 'schedule', label: 'Instructor Schedule' },
];

export default ({user}): JSX.Element => {
  	const [activeTab, setActiveTab] = useState('student-attendance');
	const [reportParameters, setReportParameters] = useState<ReportParameters>({
		organizationGuid: undefined,
		organizationName: undefined,
		year: undefined,
		startDate: undefined,
		endDate: undefined
	})

	const [reportRowCounts, dispatchRowCounts] = useReducer(reducer, {
		activity: 0,
		attendanceCheck: 0,
		family: 0,
		payroll: 0,
		program: 0,
		site: 0,
		staff: 0,
		studentAttendance: 0,
		studentSurvey: 0,
		classes: 0
	})

	const organizationFileString: string = reportParameters.organizationName?.replace(' ', '-') ?? ''

	const reportDateDisplayString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()} to ${reportParameters.endDate?.toString()}`

	const reportDateFileString: string = reportParameters.startDate && reportParameters.startDate == reportParameters.endDate 
		? `${reportParameters.startDate?.toString()}`
		: `${reportParameters.startDate?.toString()}_${reportParameters.endDate?.toString()}`

	function handleParameterChange(form: ReportParameters): void {
		setReportParameters(form)
	}

	useEffect(() => {
		if (user.claim === IdentityClaim.Administrator) {
			tabs.push({ key: 'cclc10', label: 'GT CCLC10' }, { key: 'all-staff', label: 'All Staff' });
		}
	}, [user])

	return (
		<div style={{minWidth: '90vw'}}>
			<ReportParameterInput user={user} onSubmit={handleParameterChange} />

			<hr />

			<div className="flex flex-nowrap">
				<div className="max-w-max">
					<h4 className="text-center font-bold text-xl my-1">Report Type</h4>

					<div className="border border-black rounded-md w-max h-max">
						<ul className="flex flex-col p-0">
							{tabs.map(tab => (
								<li key={tab.key}>
									<button
										onClick={() => setActiveTab(tab.key)}
										className={`w-full text-left px-4 py-2 rounded-md ${
											activeTab === tab.key ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 cursor-pointer'
										}`}
									>
										{tab.label}
										{tab.countKey && ` (${reportRowCounts[tab.countKey]})`}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="flex-grow pl-3">
					<StudentAttendanceReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'student-attendance'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'studentAttendance', payload: rows })
						}
					/>

					<FamilyAttendanceReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'family-attendance'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'family', payload: rows })
						}
					/>

					<ActivityReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'activities'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'activity', payload: rows })
						}
					/>

					<SiteSessionsReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'site-sessions'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'site', payload: rows })
						}
					/>

					<SummaryOfClassesReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'summary-of-classes'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'classes', payload: rows })
						}
					/>

					<ProgramOverviewReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'program-overview'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'program', payload: rows })
						}
					/>

					<StaffingReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'staffing'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'staff', payload: rows })
						}
					/>

					<StudentSurveyReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'student-survey'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'studentSurvey', payload: rows })
						}
					/>

					<AttendanceCheckReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'attendance-check'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'attendanceCheck', payload: rows })
						}
					/>

					<PayrollAuditReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={reportDateFileString}
						isActive={activeTab === 'payroll-audit'}
						onRowCountChange={(rows: number) =>
							dispatchRowCounts({ type: 'payroll', payload: rows })
						}
					/>

					<CCLC10Report
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						isActive={activeTab === 'cclc10'}
					/>

					<ScheduleReport
						params={reportParameters}
						dateDisplay={reportDateDisplayString}
						fileOrgName={organizationFileString}
						fileDate={`${reportParameters?.year?.startDate?.toString()}_${reportParameters?.year?.endDate?.toString()}`}
						isActive={activeTab === 'schedule'}
					/>

					<AllStaffReport isActive={activeTab === 'all-staff'} />
					</div>
			</div>
		</div>
	)
}