import { endOfDayTime, NewTime } from 'lib/time'
import { NewFreeSpot, NewTimeSpan, Spot, TimeSpan, timeSpanEnd } from './spot'
import { isRootSpot, NewRootNode, treeToSpots } from './tree'
import { head, curry } from 'lib/collections'
export type { Spot }

export interface Spots {
	todaySpots: (now: number) => Spot[]
	get: () => Spot[]
	current: (now: number) => Spot
	next: (now: number) => Spot
}

const rootToDaySpot = (dayStart: number, spot: Spot) => {
	if (!isRootSpot(spot)) {
		return spot
	}

	const dayEnd = endOfDayTime(dayStart)

	const after = NewTimeSpan(spot)
		.modify(span => (spot.time < dayStart ? span.setTime(dayStart) : span))
		.modify(span =>
			span.timeEnd() > dayEnd ? span.setDuration(dayEnd - span.time()) : span
		)
		.get()

	return NewFreeSpot({
		id: spot.id,
		time: after.time,
		duration: after.duration,
	})
}

export const newSpots = (tasks: Spot[]): Spots => {
	const tree = NewRootNode(sortSpots(tasks))

	//TODO do not call tereeToSpots every time?
	const spots = treeToSpots(tree)

	const current = (now: number): Spot =>
		spots.find(isCurrentSpot(now)) || head(spots)

	const next = (now: number): Spot => {
		const index = spots.findIndex(isCurrentSpot(now))
		return index < spots.length - 1 ? spots[index + 1] : spots[index]
	}

	//TODO configure tomorow overlap time for today spots
	//TODO return spots as Spots type
	const todaySpots = (dayStart: number): Spot[] =>
		sliceByTime(
			spots,
			dayStart,
			NewTime(dayStart).dayEnd().add(3, 'hours').value()
		).map(spot => rootToDaySpot(dayStart, spot))

	return {
		//todaySpots returns spots from now to end of the day
		todaySpots,
		get: () => spots,
		next,
		current,
	}
}

const sliceByTime = (spots: Spot[], start: number, end: number): Spot[] =>
	spots.slice(nextSpotIndex(start, spots), nextSpotIndex(end, spots) + 1)

const sortSpots = (list: Spot[]): Spot[] =>
	list.sort((a: Spot, b: Spot) => a.time - b.time)

//nextSpotIndex finds first spot after time specified
const nextSpotIndex = (time: number, spots: Spot[]): number =>
	spots.findIndex(isActiveSpot(time))

//isActiveSpot return true if spot is not end yet
export const isActiveSpot = curry(
	(now: number, spot: TimeSpan): boolean => now < timeSpanEnd(spot)
)

export const isCurrentSpot = curry(
	(now: number, t: TimeSpan): boolean => now > t.time && now < timeSpanEnd(t)
)
