export interface Spot extends TimeSpan {
	id: string
	//TODO move usage of spot name to plan
	name: string
	plan: string
}

export interface Plan {
	id: string
	name: string
}

//
//isCurrentSpot return true if spot belong to current time
export interface TimeSpan {
	time: number
	end: number
}
//
//timeSpanIntersection checks intersection of two time intervals
export const timeSpanIntersection = (a: TimeSpan, b: TimeSpan) =>
	a.time <= b.end && b.time <= a.end
//
//timeSpanInclusion checks that sub interval includeed in sup
export const timeSpanInclusion = (sub: TimeSpan, sup: TimeSpan) =>
	sup.time <= sub.time && sup.end >= sub.end

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
	after.time - before.end

interface timeSpan<T extends TimeSpan> {
	setTime(time: number): timeSpan<T>
	setDuration(duration: number): timeSpan<T>
	setEnd(time: number): timeSpan<T>
	time(): number
	duration(): number
	timeEnd(): number
	get(): T
	modify(cb: (initial: timeSpan<T>) => timeSpan<T>): timeSpan<T>
}

export const NewTimeSpanDuration = (start: number, duration: number) =>
	NewTimeSpan({ time: start, end: 0 }).setDuration(duration)

export const NewTimeSpan = <T extends TimeSpan>(span: T): timeSpan<T> => ({
	modify: (cb: (initial: timeSpan<T>) => timeSpan<T>) => cb(NewTimeSpan(span)),

	//Setters
	setTime: (time: number) => NewTimeSpan({ ...span, time }),
	setDuration: (duration: number) =>
		NewTimeSpan({ ...span, end: span.time + duration }),
	setEnd: (end: number) => NewTimeSpan({ ...span, end }),

	//Getters
	timeEnd: () => span.end,
	time: () => span.time,
	duration: () => span.end - span.time,
	//Return original object
	get: () => span,
})

export const NewFreeSpot = (spot: Omit<Spot, 'name' | 'plan'>): Spot => ({
	name: 'Free spot',
	plan: FreeSpotPlan.id,
	...spot,
})

export const NewSleepSpot = (spot: Omit<Spot, 'name' | 'plan'>): Spot => ({
	name: SleepSpotPlan.name,
	plan: SleepSpotPlan.id,
	...spot,
})

export const FreeSpotPlan: Plan = { id: 'free-spot', name: 'Free spot' }
export const SleepSpotPlan: Plan = { id: 'sleep-spot', name: 'Sleep' }
