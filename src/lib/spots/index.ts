import { curry } from 'rambda'
import { endOfDayTime } from 'lib/time'
import { Spot, TimeSpan, timeSpanEnd } from './spot'
import { NewRootNode, treeToSpots } from './tree'
export type { Spot }

export interface Spots {
	todaySpots: (now: number) => Spot[]
	get: () => Spot[]
	current: (now: number) => Spot
	next: (now: number) => Spot
}

export const newSpots = (tasks: Spot[]): Spots => {
	const tree = NewRootNode(sortSpots(tasks))

	const getSpots = (): Spot[] => treeToSpots(tree)

	const sliceByTime = (start: number, end: number): Spot[] => {
		const spots = getSpots()
		return spots.slice(
			firstNextSpot(start, spots),
			firstNextSpot(end, spots) + 1
		)
	}

	const current = (now: number): Spot => {
		const spots = getSpots()
		const index = spots.findIndex(spot => isCurrentSpot(now, spot))
		//TODO make it type safe NotEmptyArray?
		return index === -1 ? spots[0] : spots[index]
	}
	const next = (now: number): Spot => {
		const spots = getSpots()
		const index = spots.findIndex(spot => isCurrentSpot(now, spot))
		if (index < spots.length - 1) {
			//TODO make it type safe NotEmptyArray?
			return spots[index + 1]
		}
		return spots[index]
	}

	return {
		//todaySpots returns spots from now to end of the day
		todaySpots: (now: number): Spot[] => sliceByTime(now, endOfDayTime(now)),
		get: getSpots,
		next,
		current,
	}
}

const sortSpots = (list: Spot[]): Spot[] =>
	list.sort((a: Spot, b: Spot) => a.time - b.time)

const firstNextSpot = (time: number, spots: Spot[]): number =>
	spots.findIndex(curry(isActiveSpot)(time))

//isActiveSpot return true if spot is not end yet
export const isActiveSpot = (now: number, spot: TimeSpan): boolean =>
	now < timeSpanEnd(spot)

export const isCurrentSpot = (now: number, t: TimeSpan): boolean =>
	now > t.time && now < timeSpanEnd(t)

//TODO do not relay on ids but on tags maybe
//isTaskSpot determines whether spot is real task or virtual one (gap, root, etc.)
export const isTaskSpot = (spot: Spot): boolean => !spot.id.endsWith('+gap')
