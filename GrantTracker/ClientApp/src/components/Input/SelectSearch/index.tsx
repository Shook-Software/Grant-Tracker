import { useState } from 'react'
import { useSelect } from 'react-select-search'
import * as Styled from './styles'

export default ({ options, value, multiple = false, disabled = false, id, handleChange}) => {
  const [snapshot, valueProps, optionProps] = useSelect({
      options,
      value,
      multiple,
      disabled
  })

  const [searchTerm, setSearchTerm] = useState<string>('')

  valueProps.readOnly = false
  snapshot.search = searchTerm.toString()

  return (
    <Styled.Container>
      <input
        type='text'
        className={disabled ? 'text-white' : ''}
        id={id}
        autoComplete='on'
        placeholder={snapshot.search === '' ? snapshot.displayValue : snapshot.search}
        value={searchTerm}
        {...valueProps}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {snapshot.focus && (
        <Styled.OptionList>
          {snapshot.options.filter((option) => option.name.toString().toLowerCase().includes(snapshot.search)).map((option) => (
            <Styled.Option key={option.value}>
              <Styled.Button 
                {...optionProps} 
                value={option.value}
                onMouseDown={e => {
                  setSearchTerm('')
                  handleChange(e.target.value)
                }}
              >
                {option.name}
              </Styled.Button>
            </Styled.Option>
          ))}
        </Styled.OptionList>
      )}
    </Styled.Container>
  )
}