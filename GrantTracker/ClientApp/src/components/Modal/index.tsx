import React from 'react'
import {Overlay, Form, Title, TitleText, ExitButton, Content} from './styles'

interface ModalProps {
  title: string | undefined
  subtitle?: string | undefined
  show: boolean
  onHide: () => void
  children?: React.ReactNode 
}

const Modal = ({ title, subtitle, show, onHide, children }: ModalProps) => {

  if (!show)
    return null

  return (
    <Overlay>
      <Form>
        <Title hasSubtitle={subtitle !== undefined}>
          <TitleText hasSubtitle={subtitle !== undefined}>
            <p>{title}</p>
            <p>{subtitle}</p>
          </TitleText>
          <ExitButton onClick={onHide}>
            <p>X</p>
          </ExitButton>
        </Title>
        <Content hasSubtitle={subtitle !== undefined}>
          {children}
        </Content>
      </Form>
    </Overlay>
  )
}

export default Modal;