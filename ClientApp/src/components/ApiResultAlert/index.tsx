import { useEffect, useState, useRef } from 'react'
import { Alert } from 'react-bootstrap'

import WordBreak from 'components/Wordbreak'

export interface ApiResult {
  label: string
  success: boolean
  message?: string[]
}

export default ({ apiResult, scroll = true }: { apiResult: ApiResult | undefined, scroll: boolean }): JSX.Element => {
  const [show, setShow] = useState<boolean>(true)
  const alertRef: React.Ref<HTMLDivElement | null> = useRef(null)

  const variant: string = apiResult?.success ? 'success' : 'danger'
  const result: string = `${apiResult?.label} ${apiResult?.success ? ' was added!' : 'could not be added.'}`

  useEffect(() => {
    setShow(true)
    if (scroll && alertRef && alertRef.current) { 
      alertRef.current.scrollIntoView()
    }
  }, [apiResult])

  if (!apiResult || !show)
    return <div ref={alertRef} />

  return (
    <Alert
      className=''
      variant={variant}
      onClose={() => setShow(false)}
      dismissible
      ref={alertRef}
    >
      <h4 className='p-0 m-0'>{result}</h4>
      <p className='p-0 m-0'>{apiResult.message?.map(string => (<>{WordBreak(string)}<br /></>))}</p>
    </Alert>
  )
}