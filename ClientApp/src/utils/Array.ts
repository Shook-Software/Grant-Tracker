import { ReactNode } from "react"

export function range (start: number, end: number): number[] {
  return Array(end - start + 1).fill(0).map((_, index) => start + index)
}

type StandardEnum<T> = {
  [value: string]: T | string
  [key: number]: string
}

export function mapEnum (enumeration: StandardEnum<unknown>): {key: number, value: string}[] {
  const keys: number[] = mapEnumKeys(enumeration)
  return keys.map(key => {
    return {
      key: key,
      value: enumeration[key]
    }
  })
}

export function mapEnumKeys (enumeration: StandardEnum<unknown>): number[] {
  return Object.keys(enumeration)
  .filter(key => !isNaN(Number(key)))
  .map(key => Number(key))
}

export function mapEnumValues (enumeration: StandardEnum<unknown>, callback: (value: any, index: number | undefined) => ReactNode): ReactNode {
  return Object.keys(enumeration)
  .filter(key => !isNaN(Number(key)))
  .map(callback)
}