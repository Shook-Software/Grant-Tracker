import { useState, useEffect } from 'react'

export function useOutsideClickListener(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  const [containerRef, _] = useState(ref)

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (ref?.current && !containerRef.current.contains(event.target as Node) && typeof(callback) == 'function')
        callback()
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return (() => {
      document.removeEventListener('mousedown', handleDocumentClick)
    })
  }, [ref])
}