import { useRef, useEffect, useState } from 'react'
import { handleKeyDown } from './helpers'
import { useOutsideClickListener } from 'utils/React'

import { Input, InputAction, Status } from 'components/TimeRangeSelector/types'
import {
  OptionsContainer,
  Option,
  TextInput,
  SubgridTitle
} from 'components/TimeRangeSelector/styles'

function handleMinuteKeyDown (event: React.BaseSyntheticEvent, props): void {
  const [nativeEvent, action]: [KeyboardEvent, InputAction] = handleKeyDown(event)
  const {minute, setMinute, status, setStatus, setFocus, step} = props
  //we need a temporary copy to hold the first letter IF it can be awaited
  switch (action) {
    case InputAction.TypeDigit:
      const minuteInt: number = Number(nativeEvent.key)
      if (status === Status.Idle) {
        if ([1, 2, 3, 4, 5].includes(minuteInt)) {
          setStatus(Status.Await)
        }
        else {
          setFocus(Input.Period)
          setStatus(Status.Resolve)
        }
        setMinute(minuteInt)
      }
      else if (status === Status.Await) {
        setMinute((minute * 10) + minuteInt)
        setFocus(Input.Period)
        setStatus(Status.Resolve)
      }
      break
    
    case InputAction.Increment:
      setStatus(Status.Resolve)
      setMinute(minute + step)
      break

    case InputAction.Decrement:
      setStatus(Status.Resolve)
      setMinute(minute - step)
      break

    case InputAction.MoveRight:
      setFocus(Input.Period)
      break

    case InputAction.MoveLeft:
      setFocus(Input.Hour)
      break
  }
}

function minuteToString(minute: number): string {
  if (minute >=10)
    return String(minute)

  return `0${minute}`
}

interface TextProps {
  value: number
  onChange: (minuteInt: number) => void
  focus: Input
  setFocus: (focus: Input) => void
}

const Text = ({ value, onChange, focus, setFocus }: TextProps) => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)
  const [minute, setMinute] = useState<number>(value)
  const [status, setStatus] = useState<Status>(Status.Idle)

  const step: number = 15

  useOutsideClickListener(ref, () => setStatus(Status.Resolve))

  useEffect(() => {
    if (status === Status.Resolve) {
      const nearestStep: number = Math.round(minute / step) * step
      setMinute(nearestStep)
      onChange(nearestStep)
      setStatus(Status.Idle)
    }
  }, [status])

  useEffect(() => {
    if (focus === Input.Minute) 
      ref?.current?.focus()
  }, [focus])

  return (
    <TextInput
      type='text'
      id='time-input-minute'
      tabIndex={0}
      size={2}
      value={minuteToString(minute)}
      onKeyDown={event => handleMinuteKeyDown(event, {minute, setMinute, status, setStatus, setFocus, step})}
      onChange={event => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Minute)
      }}
      ref={ref}
    />
  )
}

interface VisualProps {
  value: number
  onChange: (minuteInt: number) => void
}

export const Visual = ({ value, onChange }: VisualProps): JSX.Element => {
  const step: number = 15
  let elements: number[] = []
  for (let int = 0; int < 60 ; int += step) {
    elements = [...elements, int]
  }

  const visualOptions: JSX.Element[] = elements.map(current => {
    const isActive: boolean = value === current
    return (
      <Option
        key={current}
        role='option'
        tabIndex={isActive ? 0 : -1}
        isActive={isActive}
        onClick={(event: React.BaseSyntheticEvent) => {
          event.stopPropagation()
          onChange(current)
        }}
      >
        {minuteToString(current)}
      </Option>
    )
  })

  return (
    <OptionsContainer>
      <SubgridTitle>Minute</SubgridTitle>
      {visualOptions}
    </OptionsContainer>
  )
}

export const MinuteInput = {
  Text,
  Visual
}
