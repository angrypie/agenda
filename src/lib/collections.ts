export type Arr<T> = [T, ...T[]]

export const NewNotEmptyArray = <T>(arr: T[]): Arr<T> | undefined =>
	arr.length === 0 ? undefined : [arr[0], ...arr.slice(1)]

export const NewArr = <T>(first: T, rest: T[]): Arr<T> => [first, ...rest]

export const head = <T>(arr: Arr<T>): T => arr[0]
export const last = <T>(arr: Arr<T>): T => arr[arr.length - 1]

type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>

type Curried<A extends any[], R> = <P extends Partial<A>>(
	...args: P
) => P extends A
	? R
	: A extends [...SameLength<P>, ...infer S]
	? S extends any[]
		? Curried<S, R>
		: never
	: never

export function curry<A extends any[], R>(
	fn: (...args: A) => R
): Curried<A, R> {
	return (...args: any[]): any =>
		args.length >= fn.length
			? fn(...(args as any))
			: curry((fn as any).bind(undefined, ...args))
}

export const flatMap = <R extends any>(
	fn: (n: Arr<R>, i: number) => Arr<R>,
	list: Arr<R>
): Arr<R> => {
	const [first, ...rest] = list
	const r = fn([first], 0)
	rest.forEach((n, i) => r.push(...fn([n], i + 1)))
	return r
}

export const concat = <T extends any[]>(a: T, b: T | []): T => a.concat(b) as T
