import { useContext, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Quarter, Year, YearDomain, YearView } from "Models/OrganizationYear"
import Table, { Column } from "components/BTable"

import { AppContext } from 'App'
import api from "utils/api"
import { PayPeriod, PayrollYear } from "Models/PayPeriod"
import { LocalDate } from "@js-joda/core"


export default ({}): JSX.Element => {
	const { data } = useContext(AppContext)
	const [editActive, setEditActive] = useState<boolean>(false)
	const { isPending: yearsPending, data: years, error, refetch } = useQuery({
		queryKey: ['developer/year'],
		staleTime: Infinity,
		select: (years: YearDomain[]) => years.map(year => Year.toViewModel(year))
	})

	if (yearsPending)
		return <div className='spinner-border' />

	return (
		<div className='row'>
			<div className='row mb-3'>
				<div className='col-4'>
				{
					editActive
					? <button type='button' className='btn btn-primary' onClick={() => setEditActive(false)}>Back</button>
					: <button type='button' className='btn btn-primary' onClick={() => setEditActive(true)}>Create</button>
				}
				</div>
			</div>

			<div>
			{
				editActive
				? <PayrollYearForm years={years} />
				: <Table columns={payrollYearColumns} dataset={data.payrollYears} rowProps={{key: 'guid'}} />
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

	const columns: Column[] = createPayrollYearFormColumns(yearGuids, setYearGuids)

	return (
		<div>
			<div className='row'>
				<div className='col-4'>
					<label htmlFor='py-name' className='form-label'>Payroll Year Name</label>
					<input id='py-name' className='form-control' type='text' value={name} onChange={(e) => setName(e.target.value)} />
				</div>

				<div className='col-4'>
					<label htmlFor='pr-file' className='form-label'>Payroll Dates PDF</label>
					<input id='py-file' className='form-control' type='file' onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
				</div>

				<div className='col-4 d-flex align-items-end'>
					<button type='button' className='btn btn-primary' disabled={yearGuids.length == 0 || name == '' || !file} onClick={() => submitYear()}>
						{submission.submitting ? <div className='spinner-border'/> : 'Submit'}
					</button>
				</div>
			</div>

			<div className='row mb-3'>
				{ !submission.submitting && submission.hasError ? <small className='text-danger'>The submission was unsuccessful.</small> : null }
				{ !submission.submitting && !submission.hasError && submission.submitted ? <small className='text-success'>The submission was successful!</small> : null }
			</div>
			
			<Table dataset={years} columns={columns} className='m-0' rowProps={{key: 'guid'}} />
		</div>
	)
}

const createPayrollYearFormColumns = (selectedYearGuids, setSelectedYearGuids): Column[] => [
	{
		label: '',
		attributeKey: '',
		transform: (year: YearView) => (
			<div className='form-check'>
				<input className='form-check-input' type='checkbox' 
					checked={selectedYearGuids.includes(year.yearGuid)} 
					onChange={(e) => setSelectedYearGuids(e.target.checked ? [...selectedYearGuids, year.yearGuid] : selectedYearGuids.filter(guid => guid != year.yearGuid))} 
				/>
			</div>
		),
		sortable: false
	},
	{
		label: 'Year',
		attributeKey: 'schoolYear',
		sortable: true
	}, 
	{
		label: 'Quarter',
		attributeKey: 'quarter',
		transform: (quarter) => Quarter[quarter],
		sortable: true
	}
]

const payrollPeriodColumns: Column[] = [
	{
		label: 'Period',
		attributeKey: 'period',
		cellProps: {
			className: 'text-center'
		},
		sortable: true
	},
	{
		label: 'Start Date',
		attributeKey: 'startDate',
		sortable: false,
		transform: (date: LocalDate) => date.toString()
	},
	{
		label: 'End Date',
		attributeKey: 'endDate',
		sortable: false,
		transform: (date: LocalDate) => date.toString()
	}
]

const payrollYearColumns: Column[] = [
	{
		label: 'Name',
		attributeKey: 'name',
		sortable: true
	},
	{
		label: 'GT Years',
		attributeKey: 'years',
		sortable: false,
		transform: (years: YearView[]) => years.map(y => (<><span>{y.schoolYear} - {Quarter[y.quarter]}</span><br /></>))
	},
	{
		label: 'Periods',
		attributeKey: 'periods',
		sortable: false,
		cellProps: {
			className: 'p-0'
		},
		transform: (periods: PayPeriod[]) => (
			<Table columns={payrollPeriodColumns} dataset={periods} rowProps={{key: 'period'}} className="m-0 " />
		)
	}
]