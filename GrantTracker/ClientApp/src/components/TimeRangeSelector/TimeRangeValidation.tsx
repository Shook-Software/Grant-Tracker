import { LocalTime } from '@js-joda/core'
import { cn } from '@/lib/utils'

// A time range is invalid once both ends exist and the start is not strictly
// before the end. Missing values are someone else's problem (required-field
// validation), not a range problem.
export function isInvalidTimeRange(startTime?: LocalTime | null, endTime?: LocalTime | null): boolean {
  if (!startTime || !endTime) return false
  return !startTime.isBefore(endTime)
}

export const TimeRangeError = ({ show, className }: { show: boolean; className?: string }): JSX.Element | null =>
  show
    ? <div className={cn('text-red-500 text-xs mt-1', className)}>End time must be after start time.</div>
    : null
