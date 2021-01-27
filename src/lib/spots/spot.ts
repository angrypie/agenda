export interface Spot extends TimeSpan {
	id: string
	name: string
}
//
//isCurrentSpot return true if spot belong to current time
export interface TimeSpan {
	time: number
	duration: number
}

export const gapsBetweenSpots = (spots: Spot[]): ((i: number) => number) => {
	const gaps = new Map<number, number>()
	spots.forEach((spot, i) => {
		const next = spots[i + 1]
		if (next === undefined) {
			gaps.set(i, 0)
			return
		}
		const gap = Math.max(spotsDistance(spot, next), 0)
		gaps.set(i, gap)
	})
	return (index: number) => gaps.get(index) || 0
}

export const spotsDistance = (before: Spot, after: Spot) =>
	after.time - timeSpanEnd(before)

export const timeSpanEnd = ({ time, duration }: TimeSpan) => time + duration

interface timeSpan<T extends TimeSpan> {
	setTime(time: number): timeSpan<T>
	setDuration(duration: number): timeSpan<T>
	time(): number
	duration(): number
	timeEnd(): number
	get(): T
	modify(cb: (initial: timeSpan<T>) => timeSpan<T>): timeSpan<T>
}

export const NewTimeSpan = <T extends TimeSpan>(span: T): timeSpan<T> => ({
	modify: (cb: (initial: timeSpan<T>) => timeSpan<T>) => cb(NewTimeSpan(span)),

	//Setters
	setTime: (time: number) =>
		NewTimeSpan({ ...span, time, duration: timeSpanEnd(span) - time }),
	setDuration: (duration: number) => NewTimeSpan({ ...span, duration }),

	//Getters
	timeEnd: () => timeSpanEnd(span),
	time: () => span.time,
	duration: () => span.duration,

	//Return original object
	get: () => span,
})

export const NewFreeSpot = (spot: Omit<Spot, 'name'>): Spot => ({
	name: 'Free spot',
	...spot,
})
