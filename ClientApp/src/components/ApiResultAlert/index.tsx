import { useEffect, useState, useRef } from 'react'
import { Alert } from 'react-bootstrap'

import WordBreak from 'components/Wordbreak'

export interface ApiResult {
  label: string
  success: boolean
  message?: string[]
}

export default ({ apiResult }: { apiResult: ApiResult | undefined }): JSX.Element => {
  const [show, setShow] = useState<boolean>(true)
  const alertRef: React.Ref<HTMLDivElement | null> = useRef(null)

  const variant: string = apiResult?.success ? 'success' : 'danger'
  const result: string = `${apiResult?.label} ${apiResult?.success ? ' was added!' : 'could not be added.'}`

  useEffect(() => {
    setShow(true)
    if (alertRef && alertRef.current) {
      alertRef.current.scrollIntoView()
    }
  }, [apiResult])

  if (!apiResult || !show)
    return <div ref={alertRef} />

  return (
    <Alert
      className='my-3'
      variant={variant}
      onClose={() => setShow(false)}
      dismissible
      ref={alertRef}
    >
      <Alert.Heading>{result}</Alert.Heading>
      <p>{apiResult.message?.map(string => (<>{WordBreak(string)}<br /></>))}</p>
    </Alert>
  )
}