import { Button, Container, Row, Spinner } from "react-bootstrap"
import { Options } from 'json2csv'
import { saveCSVToFile } from './fileSaver'



interface Parameters {
	children: JSX.Element | JSX.Element[]
	isLoading: boolean
	displayData: any[] | undefined
	displayName: string
	fileData?: () => any[] | any[] | undefined
	fileName?: string | undefined
	fileFields?: any[] | undefined
}


export default ({children, isLoading, displayData, displayName, fileData, fileName, fileFields}: Parameters): JSX.Element => {

	if (isLoading)
		return (
			<Spinner animation="border" role="status" />
		)
  	else if (displayData && displayData.length == 0) 
		return (
			<p className='text-warning'>No records to display...</p>
		)
  	else if (!isLoading && !displayData)
		return (
			<p className='text-danger'>An error has been encountered in loading the report.</p>
		)

	return (
		<div>
			<Row className='d-flex flex-row justify-content-center m-0'>
				<h4 className='text-center' style={{width: 'fit-content'}}>
					{displayName}
				</h4>
				<Button
					className={fileData && fileName && fileFields ? '' : 'd-none'}
					onClick={() => exportToCSV(fileData, fileFields, fileName)}
					style={{width: 'fit-content', height: 'fit-content'}}
					size='sm'
				>
					Save to CSV
				</Button>
			</Row>
			{children}
		</div>
	)
}

function exportToCSV(data, fileFields, fileName) {

	const options: Options<undefined> = { 
	  fields: fileFields, 
	  excelStrings: true, 
	  header: true
	}
  
	saveCSVToFile(data.length ? data : data(), options, fileName)
}
