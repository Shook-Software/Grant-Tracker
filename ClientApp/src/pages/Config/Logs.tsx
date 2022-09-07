import { useState, useEffect } from 'react'

import Table, { Column } from 'components/BTable'

import api from 'utils/api'

const columns: Column[] = [
  {
    label: 'First Name',
    attributeKey: 'requestor.person.firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    attributeKey: 'requestor.person.lastName',
    sortable: true
  },
  {
    label: 'Badge Number',
    attributeKey: 'requestor.person.badgeNumber',
    sortable: true
  },
  {
    label: 'Exception Message',
    attributeKey: 'message',
    sortable: true
  },
  {
    label: 'Stack Trace',
    attributeKey: 'stackTrace',
    sortable: false
  },
  {
    label: 'DateTime',
    attributeKey: 'dateTime',
    sortable: true,
    transform: (value: string) => {
      var date = new Date(value)
      //var dateStr = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
      //var timeStr = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      return <div>{date.toString()}</div>
    }
  }
]

export default (): JSX.Element => {
  document.title = 'GT - Config / Dev'
  const [state, setState] = useState([])

  useEffect(() => {
    api.get('developer/exceptions').then(res => {
      setState(res.data)
    })
  }, [])

  return <Table dataset={state} columns={columns} />
}
