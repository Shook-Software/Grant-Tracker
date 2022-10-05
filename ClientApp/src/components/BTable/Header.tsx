import { Column } from './index'
import styled from 'styled-components'

const HeaderCell = styled.th<{ sortable: boolean }>`
  ${props => props.sortable ? 'cursor: pointer;' : ''}
`

interface Props {
  columns: Column[]
  indexed: boolean,
  setSortIndex: (index: number) => void
}


export const Header = ({ columns, indexed, setSortIndex }: Props): JSX.Element => {
  function createColumnHeaders(columns: Column[]): JSX.Element | JSX.Element[] {
    return columns.map((col, index) => 
        col.headerTransform 
        ? col.headerTransform()
        : 
        <HeaderCell
          key={col.key}
          id={col.key}
          className='px-2'
          sortable={col.sortable}
          onClick={() => {
            if (col.sortable) {
              setSortIndex(index)
            }
          }}
          {...col.headerProps}
        >
          {col.label}
        </HeaderCell>
    )
  }

  const HeaderCells: JSX.Element[] = indexed
    ? [<th>#</th>, ...createColumnHeaders(columns)]
    : createColumnHeaders(columns)

  return (
    <thead>
      <tr>
        {HeaderCells}
      </tr>
    </thead>
  )
}