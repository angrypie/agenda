import { sort, curry, slice, findIndex } from 'rambda'
import { endOfDayTime } from 'lib/time'
import { Spot, TimeSpan } from './spot'
import { NewRootNode, treeToSpots } from './tree'
export { Spot }

export interface Spots {
	todaySpots: (now: number) => Spot[]
	get: () => Spot[]
	next: (now: number) => Spot | undefined
}

export const newSpots = (tasks: Spot[]): Spots => {
	const spots = sortSpots(tasks)

	const getSpots = (): Spot[] => {
		const root = NewRootNode(spots)
		return treeToSpots(root)
	}

	const sliceByTime = (start: number, end: number): Spot[] => {
		const spots = getSpots()
		return slice(
			firstNextSpot(start, spots),
			firstNextSpot(end, spots) + 1,
			getSpots()
		)
	}

	const next = (now: number): Spot | undefined => {
		const spots = getSpots()
		const index = spots.findIndex(spot => isCurrentSpot(now, spot))
		if (index < spots.length) {
			return spots[index + 1]
		}
		return undefined
	}

	return {
		//todaySpots returns spots from now to end of the day
		todaySpots: (now: number): Spot[] => sliceByTime(now, endOfDayTime(now)),
		get: getSpots,
		next,
	}
}

const sortSpots = <T extends Spot>(list: T[]): T[] =>
	sort((a: T, b: T) => a.time - b.time, list)

const firstNextSpot = (time: number, spots: Spot[]): number =>
	findIndex(curry(isActiveSpot)(time), spots)

//isActiveSpot return true if spot is not end yet
const isActiveSpot = (now: number, spot: TimeSpan): boolean =>
	now < timeSpanEnd(spot)

export const isCurrentSpot = (now: number, t: TimeSpan): boolean =>
	now > t.time && now < timeSpanEnd(t)
