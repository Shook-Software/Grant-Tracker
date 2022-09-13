import { Column, SortDirection } from './index'

function getAttributeValue (row: any, attributeKey: string): any {
  const attributes: string[] = attributeKey.split('.')
  //Allows us to access sub-indices with usual 'attribute.subAttribute' notation
  let baseValue: any = row

  attributes.forEach(attribute => {
    if (attribute != '' && baseValue) baseValue = baseValue[attribute]
  })
  return baseValue
}

function createRow (
  columns: Column[],
  row: any,
  isIndexed: boolean,
  index: number,
  rowProps: any
): JSX.Element {
  return (
    <tr
      key={row[rowProps?.key]}
      onClick={event => rowProps.onClick? rowProps?.onClick(event, row) : null}
      style={{ cursor: rowProps?.onClick ? 'pointer' : 'auto' }}
    >
      {[
        isIndexed ? <td key='index'>{index}</td> : null,
        columns.map(col => {
          let value: any = getAttributeValue(row, col.attributeKey)

          if (col.transform) {
            value =
              col.attributeKey === ''
                ? col.transform(row)
                : col.transform(row[col.attributeKey])
          }

          return (
            <td className='h-100' key={col.key} {...col.cellProps}>
              {value}
            </td>
          )
        })
      ]}
    </tr>
  )
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

interface Props {
  columns: Column[]
  dataset: any[]
  rowProps?: object
  indexed: boolean
  sortIndex: number
  sortDirection: SortDirection
}

export const Body = ({
  columns,
  dataset,
  rowProps,
  indexed,
  sortIndex,
  sortDirection
}: Props): JSX.Element => {
  const sortedDataset: object[] = sortDataset(
    dataset,
    sortIndex,
    sortDirection,
    columns
  )

  const Rows: JSX.Element[] = sortedDataset?.map((item, index) =>
    createRow(columns, item, indexed, index, rowProps)
  )

  return <tbody>{Rows}</tbody>
}
