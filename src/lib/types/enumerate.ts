export type EnumVariants = Exclude<Enum20, 0> | 20

export type Enumerate<T extends EnumVariants> =  T extends 1 ? Enum1 : T extends 2 ? Enum2 : T extends 3 ? Enum3 : T extends 4 ? Enum4 : T extends 5 ? Enum5 : T extends 6 ? Enum6 : T extends 7 ? Enum7 : T extends 8 ? Enum8 : T extends 9 ? Enum9 : T extends 10 ? Enum10 : T extends 11 ? Enum11 : T extends 12 ? Enum12 : T extends 13 ? Enum13 : T extends 14 ? Enum14 : T extends 15 ? Enum15 : T extends 16 ? Enum16 : T extends 17 ? Enum17 : T extends 18 ? Enum18 : T extends 19 ? Enum19 : T extends 20 ? Enum20 : never

type Enum1 = 0 
type Enum2 = 0  | 1
type Enum3 = 0  | 1 | 2
type Enum4 = 0  | 1 | 2 | 3
type Enum5 = 0  | 1 | 2 | 3 | 4
type Enum6 = 0  | 1 | 2 | 3 | 4 | 5
type Enum7 = 0  | 1 | 2 | 3 | 4 | 5 | 6
type Enum8 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Enum9 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
type Enum10 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Enum11 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type Enum12 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
type Enum13 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Enum14 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
type Enum15 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
type Enum16 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
type Enum17 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
type Enum18 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17
type Enum19 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18
type Enum20 = 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19

