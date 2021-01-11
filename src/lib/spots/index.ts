import { curry } from 'rambda'
import { endOfDayTime } from 'lib/time'
import { Spot, TimeSpan, timeSpanEnd } from './spot'
import { isRootSpot, NewRootNode, treeToSpots } from './tree'
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

	const before =
		spot.time === 0
			? { duration: timeSpanEnd(spot) - dayStart, time: dayStart }
			: spot

	const after =
		spot.duration === Infinity
			? { ...before, duration: endOfDayTime(dayStart) - before.time }
			: before

	return {
		id: spot.id,
		name: 'Free spot',
		time: after.time,
		duration: after.duration,
	}
}

export const newSpots = (tasks: Spot[]): Spots => {
	const tree = NewRootNode(sortSpots(tasks))

	//TODO do not call tereeToSpots every time?
	const spots = treeToSpots(tree)

	const current = (now: number): Spot => {
		const index = spots.findIndex(spot => isCurrentSpot(now, spot))
		//TODO make it type safe NotEmptyArray?
		return index === -1 ? spots[0] : spots[index]
	}
	const next = (now: number): Spot => {
		const index = spots.findIndex(spot => isCurrentSpot(now, spot))
		if (index < spots.length - 1) {
			//TODO make it type safe NotEmptyArray?
			return spots[index + 1]
		}
		return spots[index]
	}

	//TODO replace string id 'root' to constant or enum
	const todaySpots = (dayStart: number): Spot[] =>
		sliceByTime(spots, dayStart, endOfDayTime(dayStart)).map(spot =>
			rootToDaySpot(dayStart, spot)
		)

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
	spots.findIndex(curry(isActiveSpot)(time))

//isActiveSpot return true if spot is not end yet
export const isActiveSpot = (now: number, spot: TimeSpan): boolean =>
	now < timeSpanEnd(spot)

export const isCurrentSpot = (now: number, t: TimeSpan): boolean =>
	now > t.time && now < timeSpanEnd(t)

//TODO do not relay on ids but on tags maybe
//isTaskSpot determines whether spot is real task or virtual one (gap, root, etc.)
export const isTaskSpot = (spot: Spot): boolean => !spot.id.endsWith('+gap')
