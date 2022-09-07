import { Session, SessionDomain, SessionView, SessionForm } from './Session'
import { Instructor, InstructorDomain, InstructorSchoolYearView } from './Instructor'

export interface InstructorRegistrationDomain {
  sessionGuid: string
  session: SessionDomain | null

  instructorGuid: string
  instructor: InstructorDomain | null
}

export interface InstructorRegistrationView {
  sessionGuid: string
  session: SessionView | null

  instructorGuid: string
  instructor: InstructorSchoolYearView | null
}

export abstract class InstructorRegistration {
  public static toViewModel(obj: InstructorRegistrationDomain | null): InstructorRegistrationView | null {
    if (!obj)
      return null

    return {
      sessionGuid: obj.sessionGuid,
      session: Session.toViewModel(obj.session),

      instructorGuid: obj.instructorGuid,
      instructor: Instructor.toViewModel(obj.instructor)
    }
  }
}