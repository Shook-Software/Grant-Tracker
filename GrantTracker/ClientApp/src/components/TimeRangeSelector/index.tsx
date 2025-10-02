import { useState, useEffect, useRef } from 'react'
import { LocalTime } from '@js-joda/core'
import { mod } from 'utils/Math'
import { useOutsideClickListener } from 'utils/React'
import { handleKeyDown } from './Input/helpers'
import { mapEnumValues } from 'utils/Array'
import { cn } from '@/lib/utils'

// Types (moved from types.ts)
export enum Input {
  Minute = 0,
  Hour = 1,
  Period = 2,
  None
}

export enum InputAction {
  Delete = 0,
  Increment = 1,
  Decrement = 2,
  MoveRight = 3,
  MoveLeft = 4,
  Submit = 5,
  TypeDigit = 6,
  TypeChar = 7,
  None = 8
}

export enum Status {
  Await = 0,
  Idle = 1,
  Resolve = 2
}

export enum Period {
  AM = 0,
  PM = 1
}

// Helper functions for input handling
function handleHourKeyDown (event: React.BaseSyntheticEvent, props): void {
  const [nativeEvent, action]: [KeyboardEvent, InputAction] = handleKeyDown(event)
  const {hour, setHour, status, handleStatusChange: setStatus, setFocus} = props
  
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

function handleMinuteKeyDown (event: React.BaseSyntheticEvent, props): void {
  const [nativeEvent, action]: [KeyboardEvent, InputAction] = handleKeyDown(event)
  const {minute, setMinute, status, handleStatusChange: setStatus, setFocus, step} = props
  
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

// Utility functions
function hourToString(hour: number): string {
  hour = hour % 12
  if (hour >= 10)
    return String(hour)
  else if (hour === 0)
    return '12'
  return `0${hour}`
}

function minuteToString(minute: number): string {
  if (minute >= 10)
    return String(minute)
  return `0${minute}`
}

// Input Components
interface HourTextProps {
  value: number
  onChange: (hourInt: number) => void
  focus: Input
  setFocus: (focus: Input) => void
}

const HourText = ({ value, onChange, focus, setFocus }: HourTextProps): JSX.Element => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)
  const [hour, setHour] = useState<number>(value)
  const [status, setStatus] = useState<Status>(Status.Idle)

  function handleStatusChange(value: Status) {
    if (status !== value)
      setStatus(value);
  }

  useOutsideClickListener(ref, () => status !== Status.Idle ? handleStatusChange(Status.Resolve) : null)

  useEffect(() => {
    if (status === Status.Resolve) {
      handleStatusChange(Status.Idle)
      onChange(hour)
    }
    else if (status === Status.Await) {
      setTimeout(() => {
        if (status === Status.Await)
          handleStatusChange(Status.Resolve)
      }, 500);
    }
  }, [status])

  useEffect(() => {
    if (focus === Input.Hour) 
      ref?.current?.focus()
  }, [focus])

  return (
    <input
      ref={ref}
      type='text'
      id='time-input-hour'
      tabIndex={0}
      size={2}
      value={hourToString(hour)}
      onKeyDown={event => handleHourKeyDown(event, {hour, setHour, status, handleStatusChange, setFocus})}
      onChange={() => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Hour)
      }}
      className={cn(
        "w-8 text-center border-none outline-none bg-transparent",
        focus === Input.Hour ? "text-white bg-primary caret-transparent" : ""
      )}
    />
  )
}

interface MinuteTextProps {
  value: number
  onChange: (minuteInt: number) => void
  focus: Input
  setFocus: (focus: Input) => void
}

const MinuteText = ({ value, onChange, focus, setFocus }: MinuteTextProps): JSX.Element => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)
  const [minute, setMinute] = useState<number>(value)
  const [status, setStatus] = useState<Status>(Status.Idle)
  const step: number = 15

  function handleStatusChange(value: Status) {
    if (status !== value)
      setStatus(value);
  }

  useOutsideClickListener(ref, () => status !== Status.Idle ? handleStatusChange(Status.Resolve) : null)

  useEffect(() => {
    if (status === Status.Resolve) {
      const nearestStep: number = Math.round(minute / step) * step
      setMinute(nearestStep)
      onChange(nearestStep)
      handleStatusChange(Status.Idle)
    }
    else if (status === Status.Await) {
      setTimeout(() => {
        handleStatusChange(Status.Resolve)
      }, 500);
    }
  }, [status])

  useEffect(() => {
    if (focus === Input.Minute) 
      ref?.current?.focus()
  }, [focus])

  return (
    <input
      ref={ref}
      type='text'
      id='time-input-minute'
      tabIndex={0}
      size={2}
      value={minuteToString(minute)}
      onKeyDown={event => handleMinuteKeyDown(event, {minute, setMinute, status, handleStatusChange, setFocus, step})}
      onChange={() => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Minute)
      }}
      className={cn(
        "w-8 text-center border-none outline-none bg-transparent",
        focus === Input.Minute ? "text-white bg-primary caret-transparent" : ""
      )}
    />
  )
}

interface PeriodTextProps {
  value: Period
  onChange: (period: Period) => void
  focus: Input
  setFocus: (focus: Input) => void
}

const PeriodText = ({ value, onChange, focus, setFocus }: PeriodTextProps): JSX.Element => {
  const ref: React.RefObject<HTMLInputElement> = useRef(null)

  useEffect(() => {
    if (focus === Input.Period) ref?.current?.focus()
  }, [focus])

  return (
    <input
      ref={ref}
      type='text'
      id='time-input-period'
      tabIndex={0}
      size={2}
      value={Period[value]}
      onKeyDown={event => handlePeriodKeyDown(event, { value, onChange, setFocus })}
      onChange={() => {}}
      onClick={event => {
        event.stopPropagation()
        setFocus(Input.Period)
      }}
      className={cn(
        "w-8 text-center border-none outline-none bg-transparent",
        focus === Input.Period ? "text-white bg-primary caret-transparent" : ""
      )}
    />
  )
}

// Visual Option Components
interface OptionProps {
  isActive: boolean
  onClick: (event: React.BaseSyntheticEvent) => void
  children: React.ReactNode
  style?: React.CSSProperties
  role?: string
  tabIndex?: number
}

const Option = ({ isActive, onClick, children, style = {}, role, tabIndex }: OptionProps): JSX.Element => (
  <div
    role={role}
    tabIndex={tabIndex}
    onClick={onClick}
    style={style}
    className={cn(
      "text-center cursor-pointer hover:bg-gray-100",
      isActive ? "font-medium text-white bg-primary underline" : ""
    )}
  >
    {children}
  </div>
)

interface HourVisualProps {
  value: number
  onChange: (hourInt: number) => void
}

const HourVisual = ({ value, onChange }: HourVisualProps): JSX.Element => {
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
    <div className="relative left-0 right-0 grid grid-cols-2 grid-rows-7 border-r border-black">
      <div className="col-span-2 text-center border-b border-black">Hour</div>
      {visualOptions}
    </div>
  )
}

interface MinuteVisualProps {
  value: number
  onChange: (minuteInt: number) => void
}

const MinuteVisual = ({ value, onChange }: MinuteVisualProps): JSX.Element => {
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
    <div className="relative left-0 right-0 grid grid-cols-2 grid-rows-7 border-r border-black">
      <div className="col-span-2 text-center border-b border-black">Minute</div>
      {visualOptions}
    </div>
  )
}

interface PeriodVisualProps {
  value: Period
  onChange: (period: Period) => void
}

const PeriodVisual = ({ value, onChange }: PeriodVisualProps): JSX.Element => (
  <div className="relative left-0 right-0 grid grid-rows-7">
    <div className="border-b border-black" />
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
  </div>
)

// Main TimeInput Component
interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id: string,
  small?: boolean
  value: LocalTime
  onChange: (input: LocalTime) => void
}

export const TimeInput = ({
  id,
  value,
  small = false,
  onChange,
  className,
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

  function handleChange(value: LocalTime) {
    if (!value.equals(time)) {
      onChange(value);
    }
  }

  function onInputClick(event: React.BaseSyntheticEvent): void {
    event.preventDefault()
    event.stopPropagation()
    setCollapsed(!isCollapsed)
  }

  function handleHourChange(hourInt: number): void {
    const newValue = time.withHour(mod(hourInt, 24));
    if (!newValue.equals(time)) {
      setTime(newValue);
      handleChange(newValue);
    }
  }

  function handleMinuteChange(minuteInt: number): void {
    const newValue = time.withMinute(mod(minuteInt, 60));
    if (!newValue.equals(time)) {
      setTime(newValue);
      handleChange(newValue);
    }
  }

  function handlePeriodChange(input: Period): void {
    if (simplifiedTime.hour >= 12) {
      if (input == Period.AM) {
        const newValue = time.withHour(simplifiedTime.hour - 12);

        if (!newValue.equals(time)) {
          setTime(newValue)
          handleChange(newValue)
        }
      }
    }
    else {
      if (input == Period.PM) {
        const newValue = time.withHour(simplifiedTime.hour + 12);

          if (!newValue.equals(time)) {
            setTime(newValue)
            handleChange(newValue)
          }
      }
    }
  }

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
            handleChange(stateRef.current.time)
        }
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return (() => {
      document.removeEventListener('click', handleDocumentClick, true)
    })
  }, [])

  useEffect(() => {
    setTime(value.withHour(value.hour()))
  }, [value])

  useEffect(() => {
    stateRef.current.time = time
  }, [time])

  return (
    <div
      key={`${simplifiedTime.hour}-${simplifiedTime.minute}-${id}`}
      tabIndex={-1}
      ref={containerRef}
      className={cn(
        "relative block w-fit m-0 px-1 bg-background border border-input rounded-md shadow-sm transition-colors box-border",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        containerIsFocused && !isCollapsed ? "ring-1 ring-ring" : "",
        small ? "px-2 text-sm" : "",
        className
      )}
      {...props}
    >
      <div className='flex' onClick={() => setFocus(Input.Hour)}>
        <div>
          <HourText
            key={`hour - ${simplifiedTime.hour}`}
            value={simplifiedTime.hour}
            onChange={handleHourChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
          <b tabIndex={-1}>&nbsp;:&nbsp;</b>
          <MinuteText
            key={`minute - ${simplifiedTime.minute}`}
            value={simplifiedTime.minute}
            onChange={handleMinuteChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
          <PeriodText
            value={simplifiedTime.hour >= 12 ? Period.PM : Period.AM}
            onChange={handlePeriodChange}
            focus={currentFocus}
            setFocus={setFocus}
          />
        </div>
        <div className='flex flex-row-reverse flex-grow'>
          <button
            id={id}
            ref={dropdownContainerRef}
            aria-expanded={isCollapsed === false}
            aria-pressed={isCollapsed === false}
            onClick={onInputClick}
            className="border-none bg-transparent cursor-pointer"
          >
            &#11167;
          </button>
        </div>
      </div>
      
      <div className={cn(
        "flex absolute min-w-[200px] grid grid-cols-[40%_40%_20%] top-full left-0 right-0 bg-background border border-input rounded-md shadow-sm z-10",
        isCollapsed ? "hidden" : "grid"
      )}>
        <HourVisual
          value={simplifiedTime.hour}
          onChange={handleHourChange}
        />
        <MinuteVisual
          value={simplifiedTime.minute}
          onChange={handleMinuteChange}
        />
        <PeriodVisual
          value={simplifiedTime.hour >= 12 ? Period.PM : Period.AM}
          onChange={handlePeriodChange}
        />
      </div>
    </div>
  )
}
