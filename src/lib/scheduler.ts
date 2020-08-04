import { sort, curry, slice, findIndex } from 'rambda'

export interface Spot {
	id: string
	time: number
	duration: number
}

export interface Spots {
	order: Spot[]
}

export const createScheduler = (spots: Spot[]): Spots => {
	const order = sortSpots(spots)
	return { order }
}

const sortSpots = sort<Spot>((a, b) => a.time - b.time)

const sliceByTime = (start: number, end: number, spots: Spots): Spots =>
	createScheduler(
		slice(
			firstNextSpot(start, spots),
			firstNextSpot(end, spots) + 1,
			spots.order
		)
	)

const firstNextSpot = (time: number, spots: Spots): number =>
	findIndex(curry(isNotEnded)(time), spots.order)

const isNotEnded = (now: number, spot: Spot): boolean =>
	now > spot.time + spot.duration
