import styled from 'styled-components'

export const Overlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 99;
  top: 0;
  left: 0;

  background-color: rgba(0, 0, 0, 0.48);
`

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  height: 90%;
  width: 80%;

  background-color: rgba(0, 0, 0, 0.92);
  color: white;
  border-radius: 12px;
`

interface StyleProps {
  hasSubtitle: boolean;
}

export const Title = styled.div<StyleProps>`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  height: ${props => props.hasSubtitle ? '15%' : '10%'};
  width: 100%;
    
  color: white;
  border-radius: inherit;
  border-bottom: 2px solid var(--color-light-blue);
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
`

export const TitleText = styled.span<StyleProps>`column;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  width: 93%;

  & > p:first-child {
    font-size: 2rem;
  }
  & > p:last-child {
    display: ${props => props.hasSubtitle ? 'block' : 'none'};
    font-size: 1rem;
  }

  @media (min-height: 551px) {
    & > p:first-child {
      padding: 1% 2% 0% 2%;
    }
    & > p:last-child {
      padding: 0% 2% 1% 2%;
    }
  }
  @media (max-height: 550px) {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    & > p {
      padding: 1% 2% 1% 2%;
    }
  }
`

export const ExitButton = styled.div`
  display: flex;
  justify-content: center;

  height: 2.5rem;
  width: 2.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 2rem;
  text-align: center;
  border-radius: 50%;
  border: 2px solid white;

  &:hover {
    border: 2px solid var(--color-light-blue);
  }
  &:active {
    & > p {
      transform: scale(0.5);
      color: var(--color-light-blue);
    }
  }
`

export const Content = styled.div<StyleProps>`
  height: ${props => props.hasSubtitle ? '85%' : '90%'};
	overflow-y: scroll;
`