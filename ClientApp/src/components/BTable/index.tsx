import { useState } from 'react'
import { Table } from 'react-bootstrap'
import { Header } from './Header'
import { Body } from './Body'

import { mod } from 'utils/Math'

//possible additions
//left/center/right positioning in <td />
export interface Column {
  key?: string
  label: string
  attributeKey: string
  sortable: boolean
  sortTransform?: (value: any) => string
  transform?: (value: any, index: number | null) => any
  headerTransform?: () => JSX.Element
  headerProps?: object
  cellProps?: object
}

export enum SortDirection {
  None = 0,
  Ascending = 1,
  Descending = 2
}

interface Props {
  columns: Column[]
  dataset: any[]
  rowProps?: object
  defaultSort?: { index: number, direction: SortDirection }
  indexed?: boolean
  className?: string
  tableProps?: object
}

export default ({ columns, dataset, rowProps, defaultSort, indexed = false, className, tableProps }: Props): JSX.Element => {
  const [sortIndex, setSortIndex] = useState<number>(defaultSort?.index || 0)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || SortDirection.None)

  //default method of ensuring mapped elements have unique keys, not foolproof
  columns.forEach(col => {
    if (!col.key)
      col.key = col.attributeKey
  })

  function handleSortIndexChange(value: number): void {
    if (value === sortIndex) {
      setSortDirection(mod(sortDirection + 1, 3))
    }
    else {
      setSortIndex(value)
      setSortDirection(SortDirection.Ascending)
    }
  }

  return (
    <Table
      className={className}
      striped
      bordered
      hover
      {...tableProps}
      style={{border: '2px solid black', ...tableProps?.style}}
    >
      <Header
        columns={columns}
        indexed={indexed}
        setSortIndex={(value: number) => handleSortIndexChange(value)}
      />
      <Body
        columns={columns}
        dataset={dataset}
        rowProps={rowProps}
        indexed={indexed}
        sortIndex={sortIndex}
        sortDirection={sortDirection}
      />
    </Table>
  )
}