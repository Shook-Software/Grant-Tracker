import { User, GraduationCap, Hash, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/Spinner'

import { Grade } from 'Models/Grade'
import { StudentSchoolYearWithRecordsView, StudentView } from 'Models/Student'

import { minutesToTimeSpan } from 'utils/Math'
import { useMemo } from 'react'

interface Props {
  studentSchoolYear: StudentSchoolYearWithRecordsView
}

export default ({ studentSchoolYear }: Props): JSX.Element => {

  const minutesAttended = useMemo(() => getTotalMinutesAttended(studentSchoolYear), [studentSchoolYear]);

  if (!studentSchoolYear) return <Spinner variant='border' />

  const student: StudentView = studentSchoolYear.student
  

  return (
    <div>
      <div className="flex justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Hash className="h-4 w-4" />
            Matric Number
          </div>
          <div className="font-mono text-lg p-3 bg-muted/30 rounded-md">
            {student.matricNumber}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            Grade
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            <Badge variant="secondary" className="font-normal">
              {Grade.toOrdinalString(studentSchoolYear.grade)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Total Attendance
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            <span className="text-md">
              {minutesToTimeSpan(minutesAttended)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTotalMinutesAttended(data): number {
  return data.attendanceRecords.reduce((total, record) => {
    if (!record.timeRecords) return total

    const minutesForRecord = record.timeRecords.reduce((sum, tr) => {
      const start = tr.startTime.hour * 60 + tr.startTime.minute
      const end = tr.endTime.hour * 60 + tr.endTime.minute
      return sum + (end - start)
    }, 0)

    return total + minutesForRecord
  }, 0);
}