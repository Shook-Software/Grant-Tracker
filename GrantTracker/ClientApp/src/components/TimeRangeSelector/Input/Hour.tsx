import { useRef, useEffect, useState } from 'react'
import { handleKeyDown } from './helpers'
import { useOutsideClickListener } from 'utils/React'

import { Input, InputAction, Status, Period } from 'components/TimeRangeSelector/types'
import {
  OptionsContainer,
  Option,
  TextInput,
  SubgridTitle
} from 'components/TimeRangeSelector/styles'


function handleHourKeyDown (event: React.BaseSyntheticEvent, props): void {
  const [nativeEvent, action]: [KeyboardEvent, InputAction] = handleKeyDown(event)
  const {hour, setHour, status, setStatus, setFocus} = props
  //we need a temporary copy to hold the first letter IF it can be awaited
  switch (action) {
    case InputAction.TypeDigit:
      const hourInt: number = Number(nativeEvent.key)
      if (status === Status.Idle) {
        if ([0, 1, 2].includes(hourInt)) {
          setStatus(Status.Await)
        }
        else {
          setFocus(Input.Minute)
          setStatus(Status.Resolve)
        }
        setHour(hourInt)
      }
      else if (status === Status.Await) {
        setHour((hour * 10) + hourInt)
        setFocus(Input.Minute)
        setStatus(Status.Resolve)
      }
      break
    
    case InputAction.Increment:
      setStatus(Status.Resolve)
      setHour(hour + 1)
      break

    case InputAction.Decrement:
      setStatus(Status.Resolve)
      setHour(hour - 1)
      break

    case InputAction.MoveRight:
      setFocus(Input.Minute)
      break

    case InputAction.MoveLeft:
      setFocus(Input.Period)
      break
  }
}

function hourToString(hour: number): string {
  hour = hour % 12
  if (hour >= 10)
    return String(hour)
  else if (hour === 0)
    return '12'

  return `0${hour}`
}

interface TextProps {
  value: number
  onChange: (hourInt: number) => void
  focus: Input
  setFocus: (focus: Input) => void
}

const Text = ({ value, onChange, focus, setFocus }: TextProps): JSX.Element => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)
  const [hour, setHour] = useState<number>(value)
  const [status, setStatus] = useState<Status>(Status.Idle)

  useOutsideClickListener(ref, () => setStatus(Status.Resolve))

  useEffect(() => {
    if (status === Status.Resolve) {
      onChange(hour)
      setStatus(Status.Idle)
    }
  }, [status])

  useEffect(() => {
    if (focus === Input.Hour) 
      ref?.current?.focus()
  }, [focus])

  return (
    <TextInput
      type='text'
      id='time-input-hour'
      tabIndex={0}
      size={2}
      value={hourToString(hour)}
      onKeyDown={event => handleHourKeyDown(event, {hour, setHour, status, setStatus, setFocus})}
      onChange={event => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Hour)
      }}
      ref={ref}
    />
  )
}

interface VisualProps {
  value: number
  onChange: (hourInt: number) => void
}

export const Visual = ({ value, onChange }: VisualProps): JSX.Element => {
  let elements: number[] = []
  for (let int = 1; int <= 11 ; int++) {
    elements = [...elements, int]
  }
  elements = [...elements, 0]

  const visualOptions: JSX.Element[] = elements.map(current => {
    const isActive: boolean = current === value % 12
    return (
      <Option
        key={current}
        role='option'
        tabIndex={isActive ? 0 : -1}
        isActive={isActive}
        onClick={(event: React.BaseSyntheticEvent) => {
          event.stopPropagation()
          if (value >= 12)
            onChange(current + 12)
          else 
            onChange(current)
        }}
        style={{
          borderBottomLeftRadius: current === 11 ? '10px' : ''
        }}
      >
        {hourToString(current)}
      </Option>
    )
  })

  return (
    <OptionsContainer>
      <SubgridTitle>Hour</SubgridTitle>
      {visualOptions}
    </OptionsContainer>
  )
}

export const HourInput = {
  Text,
  Visual
}
