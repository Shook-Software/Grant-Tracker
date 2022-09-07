import {List, Item} from './styles'

interface Props {
  errors: string[]
}

export default ({errors}: Props): JSX.Element => {
  return (
    <List>
      {errors.map(error => <Item>{error}</Item>)}
    </List>
  )
}