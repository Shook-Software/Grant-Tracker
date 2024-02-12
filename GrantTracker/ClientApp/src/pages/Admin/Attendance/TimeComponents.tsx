
import { LocalTime } from "@js-joda/core";
import { TimeInput } from "components/TimeRangeSelector";
import { TimeScheduleForm } from "Models/TimeSchedule";
import { ReducerAction } from './state'



interface AttendanceTimeInputProps {
	personId: string
	times: TimeScheduleForm[]
	dispatchAction: string
	dispatch: React.Dispatch<ReducerAction>
}


export const AttendanceStartTimeInput = ({personId, times, dispatch}: AttendanceTimeInputProps): ReactElement[] => {

	function modifyTimesByIndex(index: number, newTime: LocalTime): TimeScheduleForm[] {
		return times.map((x, idx) => index === idx ? {...x, startTime: newTime } : x)
	}

	return times.map((schedule, index) => (
			<div key={'start-time-' + personId + index}>
				<TimeInput 
					id={'start-time-' + personId + index} 
					small={true}
					value={schedule.startTime} 
					onChange={(time) => dispatch({ type: 'setAttendanceTime', payload: { personId, times: modifyTimesByIndex(index, time)}})} 
				/>
			</div>
		)
	)
}

export const AttendanceEndTimeInput = ({personId, times, dispatch}: AttendanceTimeInputProps): ReactElement[] => {

	function modifyTimesByIndex(index: number, newTime: LocalTime): TimeScheduleForm[] {
		return times.map((x, idx) => index === idx ? {...x, endTime: newTime } : x)
	}

	return times.map((schedule, index) => (
			<div key={'end-time-' + personId + index}>
				<TimeInput 
					id={'end-time-' + personId + index} 
					small={true}
					value={schedule.endTime} 
					onChange={(time) => dispatch({ type: 'setAttendanceTime', payload: { personId, times: modifyTimesByIndex(index, time)}})} 
				/>
			</div>
		)
	)
}