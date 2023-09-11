
export interface LookupValueDomain {
  guid: string
  definitionGuid: string
  description: string
  value: string
}

export interface LookupValueView {
  description: string
  value: string
}

export abstract class LookupValue {
  public static toViewModel(obj: LookupValueDomain): LookupValueView {
    return {
      description: obj.description,
      value: obj.value
    }
  }
}