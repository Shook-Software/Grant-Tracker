import { useContext, useEffect, useState } from "react"
import { BlackoutDate, OrganizationBlackoutDateDomain, OrganizationBlackoutDateView } from 'Models/BlackoutDate'

import api from "utils/api"
import { DateTimeFormatter, LocalDate } from "@js-joda/core"
import { Locale } from "@js-joda/locale_en-us"
import { OrgYearContext } from ".."
import { ColumnDef } from "@tanstack/react-table"
import { Calendar, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import { HeaderCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/Spinner"

export const BlackoutDateConfig = (): JSX.Element => {
	const { orgYear, setOrgYear } = useContext(OrgYearContext)
	const [blackoutFetchError, setBlackoutFetchError] = useState<string | undefined>()
	const [blackoutDates, setBlackoutDates] = useState<OrganizationBlackoutDateView[]>([])
	const [blackoutDatesAreLoading, setBlackoutDatesAreLoading] = useState<boolean>(false)

	const [blackoutDeleteError, setBlackoutDeleteError] = useState<string | undefined>()

	const getAndSetBlackoutDates = (orgGuid: string) => {
		setBlackoutDatesAreLoading(true)
		getBlackoutDates(orgGuid)
			.then(res => {
				res.sort((first, second) => first.date.isBefore(second.date) ? 1 : -1)
				setBlackoutDates(res)
				setBlackoutFetchError(undefined)
			})
			.catch(err => {
				setBlackoutFetchError(err)
			})
			.finally(() => {
				setBlackoutDatesAreLoading(false)
			})
	}

	useEffect(() => {
		getAndSetBlackoutDates(orgYear?.organization.guid)
	}, [orgYear])

	const blackoutColumns: ColumnDef<OrganizationBlackoutDateView, any>[] = createBlackoutColumns(orgYear?.organization.guid, getAndSetBlackoutDates, setBlackoutDeleteError)


	return (
		<div>
			<div className='flex items-center gap-3 mb-6'>
				<h2 className='text-2xl font-bold'>Blackout Dates</h2>
				<Calendar className='h-6 w-6' />
			</div>

			{blackoutFetchError && (
				<div className='text-destructive mb-4 p-3 bg-destructive/10 rounded-md'>
					{blackoutFetchError.toString()}
				</div>
			)}
			{blackoutDeleteError && (
				<div className='text-destructive mb-4 p-3 bg-destructive/10 rounded-md'>
					{blackoutDeleteError.toString()}
				</div>
			)}

			<BlackoutDateInput orgGuid={orgYear?.organization.guid} getAndSetBlackoutDates={getAndSetBlackoutDates} />

			<div className='mt-6'>
				{blackoutDatesAreLoading ? (
					<div className="flex justify-center py-8">
						<Spinner variant="border" />
					</div>
				) : (
					<DataTable
						columns={blackoutColumns}
						data={blackoutDates}
						emptyMessage="No blackout dates configured"
						initialSorting={[{ id: 'date', desc: true }]}
						containerClassName="w-full"
					/>
				)}
			</div>
		</div>
	)
}

const BlackoutDateInput = ({orgGuid, getAndSetBlackoutDates}): JSX.Element => {
	const [blackoutDate, setBlackoutDate] = useState<LocalDate>(LocalDate.now())
	const [blackoutAddError, setBlackoutAddError] = useState<string | undefined>()
	const [isAdding, setIsAdding] = useState<boolean>(false)

	const addDate = () => {
		setIsAdding(true)
		addBlackoutDate(orgGuid, blackoutDate)
			.then(res => {
				setBlackoutAddError(undefined)
			})
			.catch(err => {
				if (err.response.status == 409)
					setBlackoutAddError('A blackout date already exists for this date.')
				else
					setBlackoutAddError(err)
			})
			.finally(() => {
				setIsAdding(false)
				getAndSetBlackoutDates(orgGuid)
			})
	}

	return (
		<div className="space-y-4">
			{blackoutAddError && (
				<div className='text-destructive p-3 bg-destructive/10 rounded-md'>
					{blackoutAddError}
				</div>
			)}

			<div className='flex items-end gap-4'>
				<div className="">
					<label className="block text-sm font-medium mb-2">Add Blackout Date</label>
					<input 
						type='date' 
						className="w-fit px-3 py-2 border border-input rounded-md bg-background h-8" 
						value={blackoutDate.toString()} 
						onChange={(event) => setBlackoutDate(LocalDate.parse(event.target.value))} 
					/>
				</div>

				<Button 
					onClick={addDate}
					disabled={isAdding}
					className="flex items-center gap-2 h-8"
					variant="outline"
					aria-label="Add blackout date"
				>
					{isAdding ? (
						<Spinner variant="border" className="h-4 w-4" />
					) : (
						<>
							<Plus />
							<Calendar />
						</>
					)}
				</Button>
			</div>
		</div>
	)
}

const createBlackoutColumns = (orgGuid: string, getAndSetBlackoutDates, setBlackoutDeleteError): ColumnDef<OrganizationBlackoutDateView, any>[] => [
	{
		accessorKey: "date",
		header: ({ column }) => (
			<HeaderCell 
				label="Date" 
				sort={column.getIsSorted()} 
				onSortClick={() => column.toggleSorting()} 
			/>
		),
		cell: ({ row }) => (
			<div className='text-left'>
				{row.original.date.format(DateTimeFormatter.ofPattern('eeee, MMMM d, y').withLocale(Locale.ENGLISH))}
			</div>
		),
		sortingFn: (rowA, rowB) => {
			const dateA = rowA.original.date
			const dateB = rowB.original.date
			if (dateA.isBefore(dateB)) return -1
			if (dateA.isAfter(dateB)) return 1
			return 0
		},
		id: 'date'
	},
	{
		header: "",
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Button 
					variant="destructive"
					size="sm"
					className="flex items-center gap-2"
					onClick={() => {
						deleteBlackoutDate(orgGuid, row.original.guid)
							.then(res => {
								getAndSetBlackoutDates(orgGuid)
								setBlackoutDeleteError(undefined)
							})
							.catch(err => {
								if (err.response.status == 404)
									setBlackoutDeleteError("Could not find a blackout date with the given identifier.")
								else 
									setBlackoutDeleteError(err)
							})
					}}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		),
		enableSorting: false,
		id: 'actions'
	}
]

const getBlackoutDates = (orgGuid: string): Promise<OrganizationBlackoutDateView[]> => {
	return new Promise<OrganizationBlackoutDateView[]>((resolve, reject) => {
		api
			.get<OrganizationBlackoutDateDomain[]>(`organization/${orgGuid}/blackout`)
			.then(res => resolve(res.data.map(x => BlackoutDate.toViewModel(x))))
			.catch(err => reject(err))
	})
}

const addBlackoutDate = (orgGuid: string, date: LocalDate): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.post(`organization/${orgGuid}/blackout`, date)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}

const deleteBlackoutDate = (orgGuid: string, blackoutGuid: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		api
			.delete(`organization/${orgGuid}/blackout/${blackoutGuid}`)
			.then(res => resolve())
			.catch(err => reject(err))
	})
}