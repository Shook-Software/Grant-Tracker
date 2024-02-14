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
  const addlClassName: string = rowProps?.classFn ? rowProps.classFn(row) : ''

  return (
    <tr
      key={`${row[rowProps?.key]}-${index}`}
      className={rowProps?.className + ' ' + addlClassName}
      onClick={event => rowProps?.onClick? rowProps?.onClick(event, row) : null}
      style={{ cursor: rowProps?.onClick ? 'pointer' : 'auto', height: '1px', backgroundColor: index % 2 == 0 ? '#CCE2FD' : '#D5E5F8'}}
    >
      {[
        isIndexed ? <td key='index' style={{height: 'inherit'}}>{index}</td> : null,
        columns.map((col, colIdx) => {
          let value: any = getAttributeValue(row, col.attributeKey)

          if (col.transform) {
            value =
              col.attributeKey === ''
                ? col.transform(row, index)
                : col.transform(value, index)
          }

          return (
            <td 
              key={colIdx + index + col.key} 
              {...col.cellProps}
              style={{height: 'inherit', ...col.cellProps?.style}}
            >
              {value}
            </td>
          )
        })
      ]}
    </tr>
  )
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

  

  const Rows: JSX.Element[] = dataset?.map((item, index) =>
    createRow(columns, item, indexed, index, rowProps)
  )

  return <tbody>{Rows}</tbody>
}
