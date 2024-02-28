import { InputAction } from 'components/TimeRangeSelector/types'
import { range } from 'utils/Array'

function getActionFromKey (nativeEvent: KeyboardEvent): InputAction {
  if (nativeEvent.code === 'ArrowUp') return InputAction.Increment
  else if (nativeEvent.code === 'ArrowDown') return InputAction.Decrement
  else if (nativeEvent.code === 'ArrowRight') return InputAction.MoveRight
  else if (nativeEvent.code === 'ArrowLeft') return InputAction.MoveLeft
  else if (nativeEvent.code === 'Enter') return InputAction.Submit
  else if (range(0, 9).includes(Number(nativeEvent.key)))
    return InputAction.TypeDigit
  else if (range(65, 90).includes(nativeEvent.keyCode))
    return InputAction.TypeChar

  return InputAction.None
}

export function handleKeyDown (
  event: React.BaseSyntheticEvent
): [KeyboardEvent, InputAction] {
  if (event?.code === 'Tab')
    return [event.nativeEvent as KeyboardEvent, InputAction.None]

  event.stopPropagation()
  event.preventDefault()

  return [
    event.nativeEvent as KeyboardEvent,
    getActionFromKey(event.nativeEvent as KeyboardEvent)
  ]
}
