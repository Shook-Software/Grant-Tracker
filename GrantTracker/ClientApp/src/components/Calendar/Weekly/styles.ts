import * as CSS from 'csstype'
import styled from 'styled-components'


const headerSize: string = '15%'

export const Container = styled.div`
  height: clamp(450px, 500px, 500px);
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;

  margin: 2px;
  border: 1px solid black;
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
`

export const DayLabel = styled.div`
  position: relative;
  height: calc(100% - ${headerSize});

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  flex: 0.5;
  top: ${headerSize};
`

export const Day = styled.div`
  height: 100%;
  flex: 1;
`

export const ActiveIndicator = styled.div<{
  isActive: boolean
}>`
  height: 15px;
  width: 100%;
  visibility: ${props => props.isActive ? 'visible' : 'hidden'};

  background-color: red;
`

export const Header = styled.h4`
  height: ${headerSize};
  text-align: center;
  margin: 0;

  & > p {
    margin: 0;
  }
`

export const Table = styled.div`
  height: calc(100% - ${headerSize});
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  border: 1px transparent;
`

export const Cell = styled.div`
  width: 100%;
  border: 1px solid black;
  box-sizing: border-box;
  flex: 1;
`

export const ActiveTimeIndicator = styled(ActiveIndicator)`
  height: 25%;
`

export const HourLabel = styled(Cell)`
  min-width: 75px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: none;
  text-align: center;
   & > p {
     margin: 0;
   }
`
