export type Arr<T> = [T, ...T[]]

export const NewNotEmptyArray = <T>(arr: T[]): Arr<T> | undefined =>
	arr.length === 0 ? undefined : [arr[0], ...arr.slice(1)]

export const NewArr = <T>(first: T, rest: T[]): Arr<T> => [first, ...rest]

export const head = <T>(arr: Arr<T>): T => arr[0]
export const last = <T>(arr: Arr<T>): T => arr[arr.length - 1]
