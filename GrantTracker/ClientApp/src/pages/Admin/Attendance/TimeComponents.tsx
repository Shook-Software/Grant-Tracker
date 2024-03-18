import { LocalTime } from "@js-joda/core";
import { TimeInput } from "components/TimeRangeSelector";
import { TimeScheduleForm } from "Models/TimeSchedule";
import { ReducerAction } from './state'
import { ReactElement } from "react";



interface AttendanceTimeInputProps {
	personId: string
	times: TimeScheduleForm[]
	dispatch: React.Dispatch<ReducerAction>
}

//the better thing to do would to be to provide the onchange method rather than have two
export const AttendanceStartTimeInput = ({personId, times, dispatch}: AttendanceTimeInputProps): ReactElement[] => {

	function modifyTimesByIndex(index: number, newTime: LocalTime): TimeScheduleForm[] {
		return times.map((x, idx) => index === idx ? {...x, startTime: newTime } : x)
	}

	function handleTimeChange(time, index) {
		dispatch({ type: 'setAttendanceStartTime', payload: { personId, times: modifyTimesByIndex(index, time)}})
	}

	return times.map((schedule, index) => (
			<div key={'start-time-' + personId + index}>
				<TimeInput 
					id={'start-time-' + personId + index} 
					small={true}
					value={schedule.startTime} 
					onChange={(time) => handleTimeChange(time, index)} 
				/>
			</div>
		)
	)
}

export const AttendanceEndTimeInput = ({personId, times, dispatch}: AttendanceTimeInputProps): ReactElement[] => {

	function modifyTimesByIndex(index: number, newTime: LocalTime): TimeScheduleForm[] {
		return times.map((x, idx) => index === idx ? {...x, endTime: newTime } : x)
	}

	function handleTimeChange(time, index) {
		dispatch({ type: 'setAttendanceEndTime', payload: { personId, times: modifyTimesByIndex(index, time)}})
	}

	return times.map((schedule, index) => (
			<div key={'end-time-' + personId + index}>
				<TimeInput 
					id={'end-time-' + personId + index} 
					small={true}
					value={schedule.endTime} 
					onChange={(time) => handleTimeChange(time, index)} 
				/>
			</div>
		)
	)
}