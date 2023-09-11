import { useRef, useEffect } from 'react'
import { handleKeyDown } from './helpers'
import { mapEnumValues } from 'utils/Array'

import { Input, InputAction, Period } from 'components/TimeRangeSelector/types'
import {
  TextInput,
  PeriodOptionsContainer,
  Option
} from 'components/TimeRangeSelector/styles' 

function handlePeriodKeyDown (event: React.BaseSyntheticEvent, props): void {
  const [nativeEvent, action]: [KeyboardEvent, InputAction] = handleKeyDown(event)

  const { value, onChange, setFocus } = props

  switch (action) {
    case InputAction.TypeChar:
      if (nativeEvent.key === 'a') 
        onChange(Period.AM)
      else if (nativeEvent.key === 'p')
        onChange(Period.PM)
      break
    
    case InputAction.Increment:
    case InputAction.Decrement:
      if (value == Period.AM)
        onChange(Period.PM)
      else
        onChange(Period.AM)
      break

    case InputAction.MoveRight:
      setFocus(Input.Hour)
      break

    case InputAction.MoveLeft:
      setFocus(Input.Minute)
      break
  }
}

interface TextProps {
  value: Period
  onChange: (period: Period) => void
  focus: Input
  setFocus: (focus: Input) => void
}

export const Text = ({ value, onChange, focus, setFocus }: TextProps): JSX.Element => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)

  useEffect(() => {
    if (focus === Input.Period) ref?.current?.focus()
  }, [focus])

  return (
    <TextInput
      type='text'
      id='time-input-period'
      tabIndex={0}
      size={2}
      value={Period[value]}
      onKeyDown={event => handlePeriodKeyDown(event, { value, onChange, setFocus })}
      onChange={event => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Period)
      }}
      ref={ref}
    />
  )
}

interface TimePeriodProps {
  value: Period
  onChange: (period: Period) => void
}

//implement our enum mapper here at some point, since we have it now
const Visual = ({ value, onChange }: TimePeriodProps): JSX.Element => (
  <PeriodOptionsContainer>
    <div style={{ gridColumn: '1/2', borderBottom: '1px solid black' }} />
    {
      mapEnumValues(Period, key => (
        <Option
          key={key}
          role='option'
          tabIndex={key == value ? 0 : -1}
          isActive={key == value}
          onClick={(event: React.BaseSyntheticEvent) => {
            event.stopPropagation()
            onChange(key)
          }}
        >
          {Period[key]}
        </Option>
        )
      )
    }
  </PeriodOptionsContainer>
)

export const PeriodInput = {
  Text,
  Visual
}
