import { LookupValue, LookupValueView, LookupValueDomain } from './LookupValue'

export type GradeString = 'KG' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'

export interface GradeDomain {
  guid: string
  gradeGuid: string
  sessionGuid: string
  grade: LookupValueDomain
}

export interface GradeView extends LookupValueView { }

export abstract class Grade {
  public static toViewModel(obj: GradeDomain): GradeView {
    return {
      ...obj.grade,
      value: obj.grade.value.length === 1 ? `0${obj.grade.value}` : obj.grade.value
    }
  }

  public static toOrdinalString(grade: GradeString): string | null {
    if (null)
      return null

    switch (grade) {
      case 'KG': return 'Kindergarten'
      case '01': return '1st'
      case '02': return '2nd'
      case '03': return '3rd'
      default: return `${grade[0] === '0' ? grade[1] : grade}th`
    }
  }
}