import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Options } from 'json2csv'

import Table, { Column, SortDirection } from 'components/BTable'
import Dropdown from 'components/Input/Dropdown'

import { getStaffSummary } from '../api'
import { saveCSVToFile } from '../fileSaver'

import { Quarter } from 'models/OrganizationYear'

const instructorColumns: Column[] = [
  {
    label: 'Last Name',
    attributeKey: 'lastName',
    sortable: true
  },
  {
    label: 'First Name',
    attributeKey: 'firstName',
    sortable: true
  },
  {
    label: '',
    attributeKey: 'instructorSchoolYearGuid',
    sortable: false,
    transform: (guid: string) => (
      <div className='d-flex justify-content-center'>
        <Button size='sm' href={`/home/admin/staff/${guid}`}>View</Button>
      </div>
    )
  }
]

function exportToCSV(data, parameters) {
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

  const fields = [
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

  const options: Options<undefined> = { 
    fields, 
    excelStrings: true, 
    header: true
  }

  saveCSVToFile(flattenedData, options, `Staffing_${parameters.schoolYear.year}_${Quarter[parameters.schoolYear.quarter]}`)
}

//thing is, an instructor may show up multiple times in a category or across categories if the date params bring in two quarters
export default ({parameters}): JSX.Element => {
  const [summary, setSummary] = useState<any[] | null>(null)
  const [status, setStatusType] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    getStaffSummary(parameters.schoolYear?.year, parameters.schoolYear?.quarter, parameters.orgGuid)
      .then(res => {
        setSummary(res)
        setStatusType(res[0].status)
      })
      .catch(err => {
        console.warn(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [parameters])

  if (isLoading)
    return <p>...Loading</p>

  if (!summary)
    return <p>An error occured in fetching results, please reload the page or file a report if the issue persists.</p>

  return (
    <Container>
      <Row className='d-flex flex-row justify-content-center'>
        <h4 className='text-center' style={{width: 'fit-content'}}>
          Staffing for {`${parameters.schoolYear?.year} ${Quarter[parameters.schoolYear?.quarter]}`}
        </h4>
        <Button
            onClick={() => exportToCSV(summary, parameters)}
            style={{width: 'fit-content', height: 'fit-content'}}
            size='sm'
          >
            Save to CSV
          </Button>
      </Row>

      <Row>
        <Col style={{maxWidth: '25%'}}>
          <Form.Group>
          <Form.Label>Staff Status Type</Form.Label>
            <Dropdown 
              value={status}
              options={summary.map(statusGroup => ({
                guid: statusGroup.status,
                label: `${statusGroup.status} (${statusGroup.instructors.length})`
              }))}
              onChange={(status: string) => setStatusType(status)}
            />
          </Form.Group>
        </Col>
        <Col className='w-50'>
          <Form.Group>
            <Form.Label>Instructors ({status})</Form.Label>
            <div
              style={{
                maxHeight: '25rem',
                overflowY: 'scroll'
              }}
            >
              <Table 
                className='m-0'
                columns={instructorColumns} 
                dataset={summary.find(statusGroup => statusGroup.status === status)?.instructors}
                defaultSort={{index: 0, direction: SortDirection.Ascending}}
                tableProps={{
                  size: 'sm'
                }}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Container>
  )
}