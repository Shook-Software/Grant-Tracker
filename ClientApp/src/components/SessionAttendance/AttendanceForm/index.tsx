//local components
import OverviewForm from './Overview'
import InstructorAttendance from './InstructorAttendance'
import SubstituteAttendance from './SubstituteAttendance'
import StudentAttendance from './StudentAttendance'

//Types and classes
import { AttendanceForm, ReducerAction } from '../state'

interface Props {
  state: AttendanceForm
  dispatch: (action: ReducerAction) => void
}

export default ({ state, dispatch }: Props): JSX.Element => {

  return (
    <>
      <OverviewForm state={state} dispatch={dispatch} />
      <InstructorAttendance state={state} dispatch={dispatch} />
      <SubstituteAttendance state={state} dispatch={dispatch} />
      <StudentAttendance state={state} dispatch={dispatch} />
    </>
  )
}