import { useState, useRef, useEffect } from 'react'
import { useOutsideClickListener } from 'utils/React'

import { Dropdown, DropdownController, OptionList, Option } from './styles'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { DropdownOption } from 'types/Session'

enum Action {
  Close = 0,
  CloseDropdown = 1,
  First = 2,
  Last = 3,
  Next = 4,
  Open = 5,
  PageDown = 6,
  PageUp = 7,
  Previous = 8,
  Select = 9,
  Type = 10,
  None = 11
}

function getActionFromKey(event, menuIsCollapsed: boolean): Action {
  const { key, altKey, ctrlKey, metaKey } = event

  const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' ']

  if (menuIsCollapsed && openKeys.includes(key)) return Action.Open
  if (key === 'Home') return Action.First
  if (key === 'End') return Action.Last
  if (
    key === 'Backspace' ||
    key === 'Clear' ||
    (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
  )
    return Action.Type

  if (!menuIsCollapsed) {
    if (key === 'ArrowUp' && altKey) return Action.CloseDropdown
    else if (key === 'ArrowUp') return Action.Previous
    else if (key === 'ArrowDown') return Action.Next
    else if (key === 'PageUp') return Action.PageUp
    else if (key === 'PageDown') return Action.PageDown
    else if (key === 'Escape') return Action.Close
    else if (key === 'Enter' || key === ' ') return Action.Select
  }
  return Action.None
}

function getActiveIndex(currentIndex, maxIndex, action): number {
    const pageSize: number = 5

    if (action === Action.First) return 0
    else if (action === Action.Last) return maxIndex
    else if (action === Action.Previous) return Math.max(0, currentIndex - 1)
    else if (action === Action.Next) return Math.min(maxIndex, currentIndex + 1)
    else if (action === Action.PageUp) return Math.max(0, currentIndex - pageSize)
    else if (action === Action.PageDown) return Math.min(maxIndex, currentIndex + pageSize)
    else if (action === Action.Select) return currentIndex

    return currentIndex;
}

//////////
//MAIN
//
//

interface Props extends Omit<Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'>, 'onChange'> {
  options: DropdownOption[]
  value: string | string[]
  onChange: ((value: string) => void) | ((value: string[]) => void)
  multipleSelect?: boolean
  show?: boolean
  disableOverlay?: boolean
  width?: string
}

//find out what the fuck activeIndex does and change to multiSelect input to be supported

export default ({ options, value, onChange, width, multipleSelect = false,  show = false, disableOverlay = false, ...props }: Props): JSX.Element => {
  if (!Array.isArray(value))
    value = [ value ]

  const [activeIndex, setIndex] = useState<number>(options.findIndex(o => o.guid == value[0]))
  const [isCollapsed, setCollapsed] = useState<boolean>(true)
  const [isListOverflowing, setListOverflow] = useState<boolean>(false)
  const [filterString, setFilter] = useState<string>('')
  const activeOptions: DropdownOption[] | undefined = options.filter((o, idx) => value.find(val => val == o.guid))

  const dropdownRef: React.RefObject<HTMLDivElement> = useRef(null)
  const listRef: React.RefObject<HTMLDivElement> = useRef(null)

  function toggleVisibility(): void {
    setCollapsed(!isCollapsed)
  }

  function onKeyDown(event, action: Action): void {
    event.preventDefault()

    const { key } = event
    const maxIndex: number = options.length - 1

    if ([
      Action.First,
      Action.Last,
      Action.Next,
      Action.Previous,
      Action.PageDown,
      Action.PageUp,
      Action.Select
    ].includes(action)) {
      const newActiveIndex = getActiveIndex(activeIndex, maxIndex, action)
      setIndex(newActiveIndex)

      if ([Action.First, Action.Last].includes(action)) {
        toggleVisibility()
      }
      else if (action === Action.Select) {
        const selectedOption = options[newActiveIndex]
        handleOptionChange(selectedOption.guid)
      }
    } 
    else if ([Action.Close, Action.Open, Action.CloseDropdown].includes(action)) {
      toggleVisibility()
    } 
    else if (action === Action.Type) {
      if (key === 'Backspace') 
        setFilter(filterString.slice(0, -1))
      else 
        setFilter(filterString + key.toLowerCase())
      
      setCollapsed(false)
    }
  }

  function handleOptionChange(newValue: string): void {
    if (!multipleSelect) {
      toggleVisibility()
    }

    let selections = [...value].filter(val => val && val != '')

    if (selections.find(s => s == newValue) && multipleSelect) {
      selections = selections.filter(s => s != newValue)
    }
    else if (multipleSelect) {
      selections = [...selections, newValue]
    }
    else {
      selections = [ newValue ]
    }

    console.log(selections)

    if (multipleSelect) onChange(selections)
    else onChange(selections.length > 0 ? selections[0] : '')
  }

  function createOption(input: DropdownOption): JSX.Element {
    return (
      <OverlayTrigger
        trigger={['hover', 'focus']}
        key={`${input.guid || input.label}`}
        placement='left'
        overlay={
          <Popover
            id='popover-basic'
            style={{
              border: '1px solid var(--bs-gray-700)',
              display: `${disableOverlay ? 'none' : 'block'}`
            }}
          >
            <Popover.Header>{input.label}</Popover.Header>
            {input.description ? (
              <Popover.Body>{input.description}</Popover.Body>
            ) : null}
          </Popover>
        }
      >
        <Option
          role='option'
          tabIndex={0}
          onClick={() => handleOptionChange(input.guid)}
          isActive={value.find(val => val == input.guid) != undefined}
        >
          <p>{input.abbreviation || input.label}</p>
        </Option>
      </OverlayTrigger>
    )
  }

  const Options: JSX.Element[] = options
    .filter(option => option.label.toLowerCase().includes(filterString))
    .map(createOption)

  useOutsideClickListener(dropdownRef, () => {
    setCollapsed(true)
  })

  useEffect(() => {
    if (!listRef?.current)
      return

    if (listRef.current.scrollHeight > listRef?.current.clientHeight) {
      setListOverflow(true)
    } else {
      setListOverflow(false)
    }
  }, [filterString, options, listRef.current])

  useEffect(() => {
    if (isCollapsed)
      setFilter('')
  }, [isCollapsed])

  useEffect(() => {
    setIndex(options.findIndex(o => o.guid === value[0]))
  }, [value, options])

  useEffect(() => {
    if (show) {
      if (isCollapsed) {
        setCollapsed(false)
      }
    }
  })


  if (!options || options.length === 0)
    return <Dropdown {...props} />

  //can we drag the optionslist popup out, then make the dropDown container just the button
  //only interactive elements need an aria attribute
  return (
    <Dropdown
      data-testid='input-dropdown'
      width={width}
      ref={dropdownRef}
      {...props}
    >
      <DropdownController
        role='button'
        id={props.id}
        aria-expanded={isCollapsed === false}
        aria-pressed={isCollapsed === false}
        tabIndex={0}
        onClick={event => {
          event.preventDefault()
          toggleVisibility()
        }}
        onKeyDown={(event): void => {
          onKeyDown(event, getActionFromKey(event, isCollapsed))
        }}
        props={props}
      >
        {value.length > 1 
          ? 'Multiple'
          : <div>{activeOptions[0]?.abbreviation || activeOptions[0]?.label}</div>
        }
      </DropdownController>
      <OptionList
        data-testid='dropdown-option-list'
        role='listbox'
        tabIndex={isCollapsed ? -1 : 0}
        isCollapsed={isCollapsed}
        isOverflowing={isListOverflowing}
        ref={listRef}
      >
        {Options}
      </OptionList>
    </Dropdown>
  )
}

/*
{activeIndex >= 0
          ? options[activeIndex]?.abbreviation || options[activeIndex]?.label
          : '-'}
*/
