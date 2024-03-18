import { useState, useEffect, ReactElement } from 'react'
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
  headerTransform?: () => ReactElement | ReactElement[]
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
  maxHeight?: string
  maxRows?: number
  indexed?: boolean
  bordered?: boolean
  showHeader?: boolean
  className?: string
  tableProps?: object
  size?: 'sm' | 'md' | 'lg'
}

const smallCellStyle = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.25rem'
}

export default ({ columns, dataset, rowProps, defaultSort, maxHeight, maxRows = 1000, size = 'md', indexed = false, bordered = true, showHeader = true, className, tableProps }: Props): JSX.Element => {
  const [sortIndex, setSortIndex] = useState<number>(defaultSort?.index || 0)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || SortDirection.None)
  const [dataToRender, setDataToRender] = useState<any[]>(dataset)
  const [pageNumber, setPageNumber] = useState<number>(0);

  if (size === 'sm')
    columns = columns.map(col => ({
      ...col, 
      cellProps: { ...col.cellProps, style: {...smallCellStyle, ...col.cellProps?.style }},
      headerProps: { ...col.headerProps, style: {...smallCellStyle, ...col.headerProps?.style }}
    }))

  const maxPages: number = Math.floor((dataToRender?.length ?? 0) / maxRows) + 1

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
    setPageNumber(0)
    setDataToRender(sortDataset(dataset, value, direction, columns))
  }

  const paginatedData = dataToRender?.slice(pageNumber * maxRows, (pageNumber + 1) * maxRows)

  return (
    <div>
      <div className={'d-flex gap-1 mb-1' + (maxPages > 1 ? '' : ' d-none')}>
        {Array.from({length: maxPages}, (_, idx) => (
          <button 
            className='btn btn-sm btn-outline-info' 
            type='button' 
            onClick={() => setPageNumber(idx)} 
            style={idx == pageNumber ? {color: '#000', backgroundColor: '#0dcaf0', borderColor: '#0dcaf0'} : {}}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div className={'mb-1' + (maxPages > 1 ? '' : ' d-none')}>
          {maxPages > 0 ? `Showing ${pageNumber * maxRows + 1} to ${(pageNumber + 1) * maxRows > dataToRender?.length ? dataToRender?.length : (pageNumber + 1) * maxRows} of ${dataToRender?.length} rows` : ''}
      </div>

      <div style={{maxHeight: maxHeight, overflowY: (maxHeight ? 'auto' : '')}}>
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
            dataset={paginatedData}
            rowProps={rowProps}
            indexed={indexed}
            sortIndex={sortIndex}
            sortDirection={sortDirection}
          />
        </Table>
      </div>
    </div>
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