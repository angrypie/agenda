import { endOfDayTime, getDayStart } from 'lib/time'
import { Spot, TimeSpan } from './spot'
import {
	findNodeDeep,
	availableTimeSpan,
	NewRootNode,
	treeToSpots,
	sliceTreeByTime,
} from './tree'
import { head, curry, Arr } from 'lib/collections'
export type { Spot }

export interface Spots {
	todaySpots: (now: number) => Arr<Spot>
	slice: (span: TimeSpan) => Arr<Spot>
	get: () => Spot[]
	current: (now: number) => Spot
	next: (now: number) => Spot
	daySpotGaps: (spot: Spot) => [number, number]
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
	const getDayTree = (dayStart: number) =>
		sliceTreeByTime(tree, createDayTimeSpan(dayStart))

	//TODO return spots as Spots type
	const todaySpots = (dayStart: number): Arr<Spot> =>
		treeToSpots(getDayTree(dayStart))

	//TODO look wider around the spot (spot may start yesterday and end tomorow)
	const daySpotGaps = (spot: Spot): [number, number] =>
		availableTimeSpan(findNodeDeep(getDayTree(getDayStart(spot.time)), spot.id))

	const slice = (span: TimeSpan): Arr<Spot> =>
		treeToSpots(sliceTreeByTime(tree, span))

	return {
		//todaySpots returns spots from now to end of the day
		todaySpots,
		get: () => spots,
		next,
		current,
		daySpotGaps,
		slice,
	}
}

const sortSpots = (list: Spot[]): Spot[] =>
	list.sort((a: Spot, b: Spot) => a.time - b.time)

//isActiveSpot return true if spot is not end yet
export const isActiveSpot = curry(
	(now: number, spot: TimeSpan): boolean => now < spot.end
)

export const isCurrentSpot = curry(
	(now: number, t: TimeSpan): boolean => now > t.time && now < t.end
)

//createDayTimeSpan creates TimeSpan from start to the end of the day
const createDayTimeSpan = (dayStart: number) => ({
	time: dayStart,
	end: endOfDayTime(dayStart),
})
