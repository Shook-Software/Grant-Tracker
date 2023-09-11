import { useState, useEffect } from 'react'
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
  bordered?: boolean
  showHeader?: boolean
  className?: string
  tableProps?: object
}

export default ({ columns, dataset, rowProps, defaultSort, indexed = false, bordered = true, showHeader = true, className, tableProps }: Props): JSX.Element => {
  const [sortIndex, setSortIndex] = useState<number>(defaultSort?.index || 0)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || SortDirection.None)
  const [dataToRender, setDataToRender] = useState<any[]>(dataset)

  useEffect(() => {
    setDataToRender(sortDataset(dataset, sortIndex, sortDirection, columns))
  }, [dataset])
 
  //default method of ensuring mapped elements have unique keys, not foolproof
  columns.forEach(col => {
    if (!col.key)
      col.key = col.attributeKey
  })

  function handleSortIndexChange(value: number): void {

    let direction = value === sortIndex ? mod(sortDirection + 1, 3) : SortDirection.Ascending

    setSortIndex(value)
    setSortDirection(direction)
    setDataToRender(sortDataset(dataset, value, direction, columns))
  }

  return (
    <Table
      className={className}
      striped
      bordered={bordered}
      hover
      {...tableProps}
      style={{border: bordered ? '2px solid black' : '', ...tableProps?.style}}
    >
      {
        showHeader ? 
        <Header
          columns={columns}
          indexed={indexed}
          setSortIndex={(value: number) => handleSortIndexChange(value)}
        />
        : null
      }
      <Body
        columns={columns}
        dataset={dataToRender}
        rowProps={rowProps}
        indexed={indexed}
        sortIndex={sortIndex}
        sortDirection={sortDirection}
      />
    </Table>
  )
}

function getAttributeValue (row: any, attributeKey: string): any {
  const attributes: string[] = attributeKey.split('.')
  //Allows us to access sub-indices with usual 'attribute.subAttribute' notation
  let baseValue: any = row

  attributes.forEach(attribute => {
    if (attribute != '' && baseValue) baseValue = baseValue[attribute]
  })
  return baseValue
}

//Ensure that the sort does not modify the original object.
//The column level value 'transform' needs to be applied here, as we sort what's on the screen, not the original api values
function sortDataset (
  dataset: any[],
  sortIndex: number,
  sortDirection: SortDirection,
  columns: Column[]
): object[] {
  if (!dataset || dataset.length === 0) return []
  if (sortDirection === SortDirection.None) return dataset

  let column: Column = columns[sortIndex]

  return [...dataset].sort((firstRow, secondRow) => {
    //we could use generics to dictate type here, probably
    
    let firstValue: any = getAttributeValue(firstRow, column.attributeKey)
    let secondValue: any = getAttributeValue(secondRow, column.attributeKey)

    if (column.sortTransform) {
      firstValue = column.sortTransform(firstValue)
      secondValue = column.sortTransform(secondValue)
    } else if (column.transform) {
      firstValue = column.transform(firstValue)
      secondValue = column.transform(secondValue)
    }

    if (firstValue > secondValue)
      return sortDirection === SortDirection.Ascending ? 1 : -1
    else if (firstValue < secondValue)
      return sortDirection === SortDirection.Ascending ? -1 : 1

    return 0
  })
}