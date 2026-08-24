import { LocalTime } from "@js-joda/core";
import { TimePickerInput as TimeInput, isInvalidTimeRange, TimeRangeError } from "components/TimeRangeSelector";
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

	if (!times)
		return <></>;

	return times.map((schedule, index) => (
			<div key={'start-time-' + personId + index}>
				<TimeInput
					id={'start-time-' + personId + index}
					small={true}
					value={schedule.startTime}
					invalid={isInvalidTimeRange(schedule.startTime, schedule.endTime)}
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

	if (!times)
		return <></>;

	return times.map((schedule, index) => {
		const rangeInvalid = isInvalidTimeRange(schedule.startTime, schedule.endTime)
		return (
			<div key={'end-time-' + personId + index}>
				<TimeInput
					id={'end-time-' + personId + index}
					small={true}
					value={schedule.endTime}
					invalid={rangeInvalid}
					onChange={(time) => handleTimeChange(time, index)}
				/>
				<TimeRangeError show={rangeInvalid} />
			</div>
		)
	})
}