import { Options } from 'json2csv'
import { saveCSVToFile } from './fileSaver'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/button'



interface Parameters {
	children: JSX.Element | JSX.Element[]
	isLoading: boolean
	hasError?: boolean
	
	displayName?: string
	fileData?: () => any[] | any[] | undefined
	fileName?: string | undefined
	fileFields?: any[] | undefined
	filteredData?: any[] | undefined
	showHeader?: boolean
}


export default ({children, isLoading, hasError, displayName, fileData, fileName, fileFields, filteredData, showHeader = false}: Parameters): JSX.Element => {

	if (isLoading)
		return (
			<Spinner className='m-7' role="status" />
		)
  	else if (!isLoading && hasError)
		return (
			<p className='text-danger m-7'>An error has been encountered in loading the report.</p>
		)

	return (
		<div>
			{showHeader && (
				<div className='flex items-center m-1'>
					<h3 style={{width: 'fit-content'}}>
						{displayName}
					</h3>
					<Button
						className={fileData && fileName && fileFields ? 'mx-3' : 'hidden'}
						onClick={() => exportToCSV(filteredData || fileData, fileFields, fileName)}
						size='sm'
					>
						Save to CSV {filteredData && filteredData.length !== (typeof fileData === 'function' ? fileData().length : fileData?.length) ? `(${filteredData.length} filtered rows)` : ''}
					</Button>
				</div>
			)}
			{children}
		</div>
	)
}

export function exportToCSV(data, fileFields, fileName) {
	console.log(data)

	const options: Options<undefined> = { 
	  fields: fileFields, 
	  excelStrings: true, 
	  header: true
	}
  
	saveCSVToFile(data.length !== undefined ? data : data(), options, fileName)
}
