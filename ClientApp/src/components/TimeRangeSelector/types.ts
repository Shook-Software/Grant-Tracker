export enum Input {
  Minute = 0,
  Hour = 1,
  Period = 2,
  None
}

//input handling
export enum InputAction {
  Delete = 0,
  Increment = 1,
  Decrement = 2,
  MoveRight = 3,
  MoveLeft = 4,
  Submit = 5,
  TypeDigit = 6,
  TypeChar = 7,
  None = 8
}

///////////////
// CLASS TYPES

export enum Status {
  Await = 0,
  Idle = 1,
  Resolve = 2
}

export enum Period {
  AM = 0,
  PM = 1
}
