import { useEffect, useState } from 'react'
import { Form, Container, Row, Col, Stack, ListGroupItem, CloseButton } from 'react-bootstrap'
import { AxiosRequestConfig } from 'axios'

import Dropdown from 'components/Input/Dropdown'
import type { DropdownOption } from 'types/Session'
import api from 'utils/api'

function getGradeOptions(): Promise<DropdownOption[]> {
  return new Promise((resolve, reject) => {
    api.get<DropdownOption[]>('dropdown/view/grades')
      .then(res => { resolve(res.data) })
      .catch(err => {
        console.warn(err)
        reject([])
      })
  })
}

export default ({ value, addGradeLevel, removeGradeLevel }): JSX.Element => {
  const [gradeOptions, setGradeOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    getGradeOptions()
      .then(options => { setGradeOptions(options) })
      .catch(empty => { setGradeOptions([]) })
  }, [])

  return (
    <div className='d-flex flex-row align-items-end'>
      <Form.Group style={{width: 'fit-content'}}>
        <Form.Label>Grade Level</Form.Label>
        <Dropdown
          options={gradeOptions.filter(option => !value.includes(option.guid))}
          value={'Add Grades...'}
          onChange={(guid: string) => addGradeLevel(guid)}
        />
      </Form.Group>
      <div className='d-flex flex-row flex-wrap'>
        {
          gradeOptions
            .filter(option => value.includes(option.guid))
            .map(option => (
              <ListGroupItem className='d-flex flex-row justify-content-between border' style={{padding: '0.35rem', marginLeft: '0.5rem'}}>
                {option.label}
                <CloseButton
                  key={option.guid}
                  className='btn-sm pt-2'
                  onClick={() => removeGradeLevel(option.guid)}
                />
              </ListGroupItem>
            ))
        }
      </div>
    </div>
  )
}
