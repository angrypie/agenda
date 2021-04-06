import { FreeSpotPlan, Spot, TimeSpan } from './spot'
import {
	findNodeByTime,
	availableTimeSpan,
	NewRootNode,
	treeToSpots,
	sliceTreeByTime,
} from './tree'
import { head, curry, Arr } from 'lib/collections'
import { NewTime } from 'lib/time'
import { pipe } from 'rambda'
export type { Spot }

export interface Spots {
	slice: (span: TimeSpan) => Arr<Spot>
	get: () => Spot[]
	current: (now: number) => Spot
	next: (now: number) => Spot
	daySpotGaps: (spot: Spot) => [number, number]
}

export const newSpots = (unfiltered: Spot[]): Spots => {
	const tasks: Spot[] = unfiltered.filter(spot => spot.plan !== FreeSpotPlan.id)
	const tree = NewRootNode(sortSpots(tasks))

	//TODO do not call tereeToSpots every time?
	const spots = treeToSpots(tree)

	const current = (now: number): Spot =>
		spots.find(isCurrentSpot(now)) || head(spots)

	const next = (now: number): Spot => {
		const index = spots.findIndex(isCurrentSpot(now))
		return index < spots.length - 1 ? spots[index + 1] : spots[index]
	}

	const daySpotGaps = (spot: Spot): [number, number] =>
		spot.plan === FreeSpotPlan.id
			? [spot.time, spot.end]
			: availableTimeSpan(findNodeByTime(tree, spot))

	const slice = (span: TimeSpan): Arr<Spot> =>
		treeToSpots(sliceTreeByTime(tree, span))

	return {
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

export const siblingDaysSpan = (todayTime: number, n: number): TimeSpan =>
	pipe(NewTime, t => ({
		time: t.subtract(n, 'day').dayStart().value(),
		end: t.add(n, 'day').dayEnd().value(),
	}))(todayTime)
