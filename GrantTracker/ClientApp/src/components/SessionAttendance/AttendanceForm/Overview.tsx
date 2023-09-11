//node_modules
import { Container, Row, Col } from 'react-bootstrap'

//local components
import AttendanceTimeInput, { TimeInputType } from './TimeInput'

//custom components
import Dropdown from 'components/Input/Dropdown'

//types
import { AttendanceForm, ReducerAction } from '../state'
import type { AttendanceRecord } from './TimeInput'
import type { DropdownOption } from 'Models/Session'


interface Props {
  state: AttendanceForm
  dispatch: (action: ReducerAction) => void
  dateOptions: DropdownOption[]
}

export default ({state, dispatch, dateOptions}: Props): JSX.Element => {
  //const [dateOptions, setDateOptions] = useState<DropdownOption[]>([])

  const defaultAttendance: AttendanceRecord[] = state.defaultSchedule.map(schedule => ({
    personGuid: '',
    startTime: schedule.startTime,
    endTime: schedule.endTime
  }))

  return (
    <Container className='p-0'>
      <Row lg={5} className='px-1'>
        <Col>
          <label htmlFor='date-select'>Session Date</label>
          <Dropdown
            id='date-select'
            options={dateOptions}
            value={state.date.toString()}
            onChange={(value: string) => dispatch({ type: 'instanceDate', payload: value })}
            disableOverlay
          />
        </Col>
      </Row>

      <Row className='d-flex flex-row my-3 px-1'>
        <div style={{ width: 'fit-content' }}>
          <label>Set all start times:</label>
          <AttendanceTimeInput 
            records={defaultAttendance}
            inputType={TimeInputType.Start}
            onChange={(_, time, index) => dispatch({
              type: 'scheduleStartShift',
              payload: { index, startTime: time }
            })}
          />
        </div>
        <div style={{ width: 'fit-content' }}>
          <label>Set all exit times:</label>
          <AttendanceTimeInput 
            records={defaultAttendance}
            inputType={TimeInputType.End}
            onChange={(_, time, index) => dispatch({
              type: 'scheduleEndShift',
              payload: { index, endTime: time}
            })}
          />
        </div>
      </Row>
    </Container>
  )
}