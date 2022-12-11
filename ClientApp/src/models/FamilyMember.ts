

export enum FamilyMember {
  None = -1,
  Mother = 0,
  Father = 1,
  Guardian = 2,
  Grandma = 3,
  Grandfather = 4,
  OtherAdult = 5
} 

export default abstract class {
 public static toString(enumValue: FamilyMember): string {
  switch (enumValue) {
    case FamilyMember.Mother:
    case FamilyMember.Father:
    case FamilyMember.Guardian:
    case FamilyMember.Grandma:
    case FamilyMember.Grandfather:
      return FamilyMember[enumValue]
    case FamilyMember.OtherAdult:
      return 'Other Adult'
    case FamilyMember.None:
      return 'None'
    default:
      throw new Error('No enum value exists or has been defined for ' + enumValue)
  }
 }
}