import { useQuery } from '@tanstack/react-query'
import { memo, useEffect, useMemo, useState } from 'react'

import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"
import { DataTable } from "components/DataTable"
import { ReportParameters } from '../ReportParameters'
import { familyAttendanceFields, flattenFamilyAttendance } from '../Definitions/CSV'
import ReportComponent, { exportToCSV } from '../ReportComponent'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface FamilyAttendanceRecord {
	familyMember: string
	totalDays: number
	totalHours: number
}

interface FamilyAttendanceData {
	lastName: string
	firstName: string
	matricNumber: string
	grade: string
	familyAttendance: FamilyAttendanceRecord[]
}

// Nested table component for family members
const FamilyMembersTable = ({ familyAttendance }: { familyAttendance: FamilyAttendanceRecord[] }) => {
	const familyColumns: ColumnDef<FamilyAttendanceRecord, any>[] = [
		{
			accessorKey: "familyMember",
			header: () => <div className="font-bold">Family Member</div>,
			cell: ({ row }) => <div>{row.getValue("familyMember")}</div>,
			id: 'familyMember'
		},
		{
			accessorKey: "totalDays",
			header: () => <div className="font-bold text-center">Total Days</div>,
			cell: ({ row }) => (
				<div className="text-center">{Math.floor((row.getValue("totalDays") as number) * 100) / 100}</div>
			),
			id: 'totalDays'
		},
		{
			accessorKey: "totalHours", 
			header: () => <div className="font-bold text-center">Total Hours</div>,
			cell: ({ row }) => (
				<div className="text-center">{Math.floor((row.getValue("totalHours") as number) * 100) / 100}</div>
			),
			id: 'totalHours'
		}
	]

	return (
		<DataTable
			columns={familyColumns}
			data={familyAttendance}
			initialSorting={[{ id: 'familyMember', desc: false }]}
			containerClassName="border-0"
			tableClassName="w-full table-auto"
		/>
	)
}

interface Props {
	params: ReportParameters
	dateDisplay: string
	fileOrgName: string
	fileDate: string
	isActive: boolean
	onRowCountChange: (rows: number) => void
}

export default ({params, dateDisplay, fileOrgName, fileDate, isActive, onRowCountChange}: Props) => {
	const { isPending, error, data: report, refetch } = useQuery({
		queryKey: [ `report/familyAttendance?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}` ],
		retry: false,
		staleTime: Infinity,
		enabled: !!params.startDate && !!params.endDate
	})

	const { data: regularMatricNumbers } = useQuery({ 
		queryKey: [`report/studentDaysAttended?startDateStr=${params.startDate?.toString()}&endDateStr=${params.endDate?.toString()}&organizationGuid=${params.organizationGuid}`],
		retry: false,
		staleTime: Infinity,
		select: filterRegulars
	})
	  
	const [showRegularsOnly, setShowRegularsOnly] = useState<boolean>(false)

	useEffect(() => {
	  onRowCountChange(report?.length || 0)
	}, [report])

	const familyTypeOptions: string[] = useMemo<string[]>(() => [...new Set<string>(report?.flatMap(x => x.familyAttendance).map(attend => attend.familyMember))], [report])

	// Column definitions for family attendance table
	const familyAttendanceColumns = useMemo<ColumnDef<FamilyAttendanceData, any>[]>(() => [
		{
			accessorKey: "lastName",
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
			accessorKey: "firstName",
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
			accessorKey: "matricNumber",
			header: ({ column }) => (
				<HeaderCell 
					label="Matric Number" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
				/>
			),
			id: 'matricNumber'
		},
		{
			accessorKey: "grade",
			header: ({ column }) => (
				<HeaderCell 
					label="Grade" 
					sort={column.getIsSorted()} 
					onSortClick={() => column.toggleSorting()} 
				/>
			),
			cell: ({ row }) => (
				<div className='text-center'>{row.getValue("grade")}</div>
			),
			id: 'grade'
		},
		{
			accessorKey: "familyAttendance",
			header: ({ column }) => {
				const filterOptions = familyTypeOptions.map(type => ({ value: type, label: type }))
				return (
					<HeaderCell
						label="Family Member"
						filterOptions={filterOptions}
						filterValue={column.getFilterValue() as string}
						onFilterSelect={(value) => column.setFilterValue(value)}
					/>
				)
			},
			filterFn: (row, id, value) => {
				const familyAttendance = row.getValue(id) as FamilyAttendanceRecord[]
				if (!value) return true
				return familyAttendance.some(member => member.familyMember === value)
			},
			cell: ({ row }) => (
				<div className="p-0">
					<FamilyMembersTable familyAttendance={row.getValue("familyAttendance")} />
				</div>
			),
			id: 'familyAttendance'
		}
	], [familyTypeOptions])

	// Apply filters to the data (keep Regular Attendees filter outside the table)
	const filteredData = useMemo(() => {
		return report?.filter(x => !showRegularsOnly || (regularMatricNumbers || []).includes(x.matricNumber)) || []
	}, [report, showRegularsOnly, regularMatricNumbers])

	if (!isActive)
		return null;
	
	return (
		<ReportComponent
			isLoading={isPending}
			hasError={!!error}
		> 
			<div className='flex items-center gap-4 mt-4'>
				<Checkbox
					id="regular-attendees"
					checked={showRegularsOnly}
					onCheckedChange={(_) => setShowRegularsOnly(!showRegularsOnly)}
				/>
				<label className="text-sm font-medium" htmlFor="regular-attendees">
					Regular Attendees Only
				</label>
			</div>

			<div className="max-h-[45rem] overflow-auto w-fit relative">
				<DataTable 
					columns={familyAttendanceColumns}
					data={filteredData}
					initialSorting={[{ id: 'lastName', desc: false }]}
					containerClassName="rounded border w-fit"
					tableClassName="table-auto"
					title={`Family Attendance Attendance for ${params.organizationName}, ${dateDisplay}`}
					renderDownload={(values) => {
						if (values.length === 0) return <></>

						const flattened = flattenFamilyAttendance(values)

						return (
							<Button
								className='mx-3'
								onClick={() => exportToCSV(flattened, familyAttendanceFields, `Family_Attendance_${fileOrgName}_${fileDate}`)}
								size='sm'
							>
								Save to CSV {flattened && values.length !== (report.length) ? `(${flattened.length} filtered rows)` : ''}
							</Button>
						)
					}}
				/>
			</div>
		</ReportComponent>
	)
}

interface StudentDaysDTO {
	organizationGuid: string
	studentGuid: string
	matricNumber: string
	daysAttended: number
}
function filterRegulars(studentDays: StudentDaysDTO[]) {
	return studentDays
		.filter(student => student.daysAttended >= 30)
		.map(student => student.matricNumber)
}