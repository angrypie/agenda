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

const spotsDistance = (before: Spot, after: Spot) =>
	after.time - timeSpanEnd(before)

export const timeSpanEnd = ({ time, duration }: TimeSpan) => time + duration
