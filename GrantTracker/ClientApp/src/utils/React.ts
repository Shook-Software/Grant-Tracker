import { useState, useEffect } from 'react'

export function useOutsideClickListener(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {

  const [containerRef, _] = useState(ref)

  function handleDocumentClick(event: MouseEvent) {
    if (!containerRef?.current?.contains(event.target as Node))
      callback()
  }

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, true)
    return (() => {
      document.removeEventListener('click', handleDocumentClick, true)
    })
  }, [])
}