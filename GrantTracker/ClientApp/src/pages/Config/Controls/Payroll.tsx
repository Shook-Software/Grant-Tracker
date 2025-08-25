import { useContext, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Quarter, Year, YearDomain, YearView } from "Models/OrganizationYear"
import { DataTable } from "components/DataTable"
import { Button } from "components/ui/button"
import { FormControl } from "components/Form"

import { AppContext } from 'App'
import api from "utils/api"
import { PayPeriod, PayrollYear } from "Models/PayPeriod"
import { LocalDate } from "@js-joda/core"
import { ColumnDef } from "@tanstack/react-table"
import { HeaderCell } from "@/components/ui/table"


export default ({}): JSX.Element => {
	const { data } = useContext(AppContext)
	const [editActive, setEditActive] = useState<boolean>(false)
	const { isPending: yearsPending, data: years, error, refetch } = useQuery({
		queryKey: ['developer/year'],
		staleTime: Infinity,
		select: (years: YearDomain[]) => years.map(year => Year.toViewModel(year))
	})

	if (yearsPending)
		return (
			<div className="flex flex-col items-center justify-center h-40 gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<small className='text-gray-500'>Loading Payroll Years...</small>
			</div>
		)

	return (
		<div className='space-y-4'>
			<div className='flex'>
				{
					editActive
					? <Button onClick={() => setEditActive(false)}>Back</Button>
					: <Button onClick={() => setEditActive(true)}>Create</Button>
				}
			</div>

			<div>
			{
				editActive
				? <PayrollYearForm years={years} />
				: <DataTable 
						columns={payrollYearColumns} 
						data={data.payrollYears || []} 
						emptyMessage="No payroll years found."
						className="hover:bg-gray-50"
					/>
			}
			</div>
		</div>
	)
}


const PayrollYearForm = ({years}): JSX.Element => {
	const { refetchPayrollYears } = useContext(AppContext)
	const [yearGuids, setYearGuids] = useState<string[]>([])
	const [name, setName] = useState<string>('')
	const [file, setFile] = useState<File | null>(null)
	const [submission, setSubmission] = useState<{submitting: boolean, hasError: boolean, submitted: boolean}>({
		submitting: false,
		hasError: false,
		submitted: false
	})

	function submitYear() {
		setSubmission({hasError: false, submitting: true, submitted: false})

		let hasError = false;
		const formData: FormData = new FormData();
		formData.append('name', name);
		formData.append('file', file as Blob);
		yearGuids.map(guid => formData.append('yearGuids[]', guid))

		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		}

		api.post('developer/payrollYear', formData, config)
		.then(res => {
			refetchPayrollYears()
		})
		.catch(err => {
			hasError = true;
		})
		.finally(() => {
			setSubmission({hasError, submitting: false, submitted: true})
		})
	}

	const columns: ColumnDef<YearView>[] = createPayrollYearFormColumns(yearGuids, setYearGuids)

	return (
		<div className='space-y-4'>
			<div className='flex gap-4'>
				<div className='flex-1'>
					<label htmlFor='py-name' className='block text-sm font-medium text-gray-700 mb-1'>Payroll Year Name</label>
					<FormControl id='py-name' type='text' value={name} onChange={(e) => setName(e.target.value)} />
				</div>

				<div className='flex-1'>
					<label htmlFor='pr-file' className='block text-sm font-medium text-gray-700 mb-1'>Payroll Dates PDF</label>
					<input 
						id='py-file' 
						className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
						type='file' 
						onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
					/>
				</div>

				<div className='flex items-end'>
					<Button disabled={yearGuids.length == 0 || name == '' || !file} onClick={() => submitYear()}>
						{submission.submitting ? (
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						) : 'Submit'}
					</Button>
				</div>
			</div>

			<div>
				{ !submission.submitting && submission.hasError && (
					<small className='text-red-600'>The submission was unsuccessful.</small>
				)}
				{ !submission.submitting && !submission.hasError && submission.submitted && (
					<small className='text-green-600'>The submission was successful!</small>
				)}
			</div>
			
			<DataTable 
				columns={columns} 
				data={years || []} 
				emptyMessage="No years found."
				className="hover:bg-gray-50"
			/>
		</div>
	)
}

const createPayrollYearFormColumns = (selectedYearGuids, setSelectedYearGuids): ColumnDef<YearView>[] => [
	{
		header: 'Select',
		id: 'select',
		cell: ({ row }) => {
			const year = row.original
			return (
				<div className='flex justify-center'>
					<input 
						type='checkbox'
						className='rounded'
						checked={selectedYearGuids.includes(year.yearGuid)} 
						onChange={(e) => setSelectedYearGuids(e.target.checked ? [...selectedYearGuids, year.yearGuid] : selectedYearGuids.filter(guid => guid != year.yearGuid))} 
					/>
				</div>
			)
		},
		enableSorting: false
	},
	{
		header: 'Year',
		accessorKey: 'schoolYear'
	}, 
	{
		header: 'Quarter',
		accessorKey: 'quarter',
		cell: ({ row }) => Quarter[row.original.quarter]
	}
]

const payrollPeriodColumns: ColumnDef<PayPeriod>[] = [
	{
		header: 'Period',
		accessorKey: 'period',
		cell: ({ row }) => (
			<div className='text-center'>{row.original.period}</div>
		)
	},
	{
		header: 'Start Date',
		accessorKey: 'startDate',
		cell: ({ row }) => row.original.startDate.toString(),
		enableSorting: false
	},
	{
		header: 'End Date',
		accessorKey: 'endDate',
		cell: ({ row }) => row.original.endDate.toString(),
		enableSorting: false
	}
]

const payrollYearColumns: ColumnDef<PayrollYear>[] = [
	{
		header: 'Name',
		accessorKey: 'name',
		cell: ({ row }) => <div  className='space-y-1 h-full'>{row.original.name}</div>,
		meta: {
			className: 'h-1'
		},
	},
	{
		header: 'GT Years',
		accessorKey: 'years',
		cell: ({ row }) => {
			const years = row.original.years
			return (
				<div className='space-y-1 h-full'>
					{years.map((y, idx) => (
						<div key={idx}>{y.schoolYear} - {Quarter[y.quarter]}</div>
					))}
				</div>
			)
		},
		meta: {
			className: 'h-1'
		},
		enableSorting: false,
	},
	{
		header: 'Periods',
		accessorKey: 'periods',
		cell: ({ row }) => (
			<DataTable 
				columns={payrollPeriodColumns} 
				data={row.original.periods} 
				emptyMessage="No periods found."
				containerClassName="border-0 rounded-none"
			/>
		),
		meta: {
			className: 'py-0',
			filter: false
		},
		enableSorting: false,
		filterFn: undefined
	}
]