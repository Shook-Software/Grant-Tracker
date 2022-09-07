export const daysOfWeekNumeric = [0, 1, 2, 3, 4, 5, 6] as const
export type DayOfWeekNumeric = typeof daysOfWeekNumeric[number]
export type DayOfWeekString =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
export type DayOfWeekChar = 'Su' | 'M' | 'Tu' | 'W' | 'Th' | 'F' | 'Sa'

export abstract class DayOfWeek {
  static readonly Sunday: 0 = 0
  static readonly Monday: 1 = 1
  static readonly Tuesday: 2 = 2
  static readonly Wednesday: 3 = 3
  static readonly Thursday: 4 = 4
  static readonly Friday: 5 = 5
  static readonly Saturday: 6 = 6

  public static toString (day: DayOfWeekNumeric): DayOfWeekString {
    switch (day) {
      case DayOfWeek.Sunday:
        return 'Sunday'
      case DayOfWeek.Monday:
        return 'Monday'
      case DayOfWeek.Tuesday:
        return 'Tuesday'
      case DayOfWeek.Wednesday:
        return 'Wednesday'
      case DayOfWeek.Thursday:
        return 'Thursday'
      case DayOfWeek.Friday:
        return 'Friday'
      case DayOfWeek.Saturday:
        return 'Saturday'
    }
  }

  public static toChar (day: DayOfWeekString | DayOfWeekNumeric): DayOfWeekChar {
    switch (day) {
      case 'Sunday':
      case 0:
        return 'Su'
      case 'Monday':
      case 1:
        return 'M'
      case 'Tuesday':
      case 2:
        return 'Tu'
      case 'Wednesday':
      case 3:
        return 'W'
      case 'Thursday':
      case 4:
        return 'Th'
      case 'Friday':
      case 5:
        return 'F'
      case 'Saturday':
      case 6:
        return 'Sa'
    }
  }

  public static toInt (day: DayOfWeekString): DayOfWeekNumeric {
    switch (day) {
      case 'Sunday':
        return 0
      case 'Monday':
        return 1
      case 'Tuesday':
        return 2
      case 'Wednesday':
        return 3
      case 'Thursday':
        return 4
      case 'Friday':
        return 5
      case 'Saturday':
        return 6
    }
  }

  public static charToInt (day: DayOfWeekChar): DayOfWeekNumeric {
    switch (day) {
      case 'Su':
        return 0
      case 'M':
        return 1
      case 'Tu':
        return 2
      case 'W':
        return 3
      case 'Th':
        return 4
      case 'F':
        return 5
      case 'Sa':
        return 6
    }
  }

  public static Sort (days: DayOfWeekString[]): DayOfWeekString[] {
    let sortDays = days.map(day => this.toInt(day))
    sortDays = sortDays.sort()
    return sortDays.map(day => this.toString(day))
  }
}
