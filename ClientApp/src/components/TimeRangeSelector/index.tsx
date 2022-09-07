import { useState, useEffect, useRef } from 'react'
import { LocalTime } from '@js-joda/core'

import { Period, Input } from './types'

import { HourInput } from './Input/Hour'
import { MinuteInput } from './Input/Minute'
import { PeriodInput } from './Input/Period'

import { Row, Col } from 'react-bootstrap'
import {
  Container,
  TextInputButton,
  VisualInputContainer,
  SelectionGrid
} from './styles'
import { mod } from 'utils/Math'

//ToDo
//Create a visual indicator to open the absolute dropdown, just cause

interface Props
  extends Omit<
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'>,
  'onChange'
  > {
  value: LocalTime
  onChange: (input: LocalTime) => void
}

//utilize tab and shift tab
export const TimeInput = ({
  value,
  onChange,
  ...props
}: Props): JSX.Element => {
  const [containerIsFocused, setContainerFocus] = useState<boolean>(false)
  const [time, setTime] = useState<LocalTime>(value.withHour(value.hour()))
  const [isCollapsed, setCollapsed] = useState<boolean>(true)
  const [currentFocus, setFocus] = useState<Input>(Input.None)

  const dropdownContainerRef: React.RefObject<HTMLButtonElement> = useRef(null)
  const containerRef: React.RefObject<HTMLDivElement> = useRef(null)
  const stateRef = useRef({
    time: time,
    containerIsFocused: containerIsFocused
  })

  const simplifiedTime = {
    hour: time.hour(),
    minute: time.minute()
  }

  function onInputClick(event: React.BaseSyntheticEvent): void {
    event.preventDefault()
    event.stopPropagation()
    setCollapsed(!isCollapsed)
  }

  function handleHourChange(hourInt: number): void {
    hourInt = mod(hourInt, 24)
    setTime(time.withHour(hourInt))
  }

  //could change both of these to .setValue then combine them
  function handleMinuteChange(minuteInt: number): void {
    minuteInt = mod(minuteInt, 60)
    setTime(time.withMinute(minuteInt))
  }

  function handlePeriodChange(input: Period): void {
    if (simplifiedTime.hour >= 12) {
      if (input == Period.AM)
        setTime(time.withHour(simplifiedTime.hour - 12))
    }
    else {
      if (input == Period.PM)
        setTime(time.withHour(simplifiedTime.hour + 12))
    }
  }

  //I promise that all of this is entirely mandatory to rerender at appropriate times to update other components but also not collapse the menu after a single click.
  //Onchange is only passed when a user clicks off of the element.
  useEffect(() => {

    const setContainerFocusState = (value: boolean) => {
      stateRef.current.containerIsFocused = value
      setContainerFocus(value)
    }

    function handleDocumentClick(event: MouseEvent) {
      if (containerRef.current && dropdownContainerRef.current) {

        if (containerRef.current.contains(event.target as Node)) {
          setContainerFocusState(true)
        }
        else if (!containerRef.current.contains(event.target as Node) && stateRef.current.containerIsFocused) {
          setContainerFocusState(false)
          setFocus(Input.None)
          setCollapsed(true)
          if (!stateRef.current.time.equals(value))
            onChange(stateRef.current.time)
        }
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return (() => {
      document.removeEventListener('click', handleDocumentClick, true)
    })
  }, [])

  useEffect(() => {
    stateRef.current.time = time
  }, [time])

  //Move this aria stuff into something else, make it a button
  return (
    <Container
      tabIndex={-1}
      isCollapsed={isCollapsed}
      ref={containerRef}
      {...props}
    >
      <Row onClick={() => setFocus(Input.Hour)}>
        <Col lg='auto' md='auto'>
          <HourInput.Text
            key={`hour - ${simplifiedTime.hour}`}
            value={simplifiedTime.hour}
            onChange={handleHourChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
          <b tabIndex={-1}>&nbsp;:&nbsp;</b>
          <MinuteInput.Text
            key={`minute - ${simplifiedTime.minute}`}
            value={simplifiedTime.minute}
            onChange={handleMinuteChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
          <PeriodInput.Text
            value={simplifiedTime.hour >= 12 ? Period.PM : Period.AM}
            onChange={handlePeriodChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
        </Col>
        <Col className='d-inline-flex flex-row-reverse'>
          <TextInputButton
            id={props.id}
            aria-expanded={isCollapsed === false}
            aria-pressed={isCollapsed === false}
            onClick={event => onInputClick(event)}
            ref={dropdownContainerRef}
          >
            &#11167;
          </TextInputButton>
        </Col>
      </Row>
      <VisualInputContainer className='px-0'>
        <SelectionGrid isCollapsed={isCollapsed}>
          <HourInput.Visual
            value={simplifiedTime.hour}
            onChange={handleHourChange}
          />
          <MinuteInput.Visual
            value={simplifiedTime.minute}
            onChange={handleMinuteChange}
          />
          <PeriodInput.Visual
            value={simplifiedTime.hour >= 12 ? Period.PM : Period.AM}
            onChange={handlePeriodChange}
          />
        </SelectionGrid>
      </VisualInputContainer>
    </Container>
  )
}
