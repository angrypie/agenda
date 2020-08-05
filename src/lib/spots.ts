import { sort, curry, slice, findIndex } from 'rambda'
import dayjs from 'dayjs'

export interface Spot {
	id: string
	time: number
	duration: number
}

export interface Spots {
	order: Spot[]
}

const newSortedSpots = (order: Spot[]): Spots => ({ order })

export const createSpots = (spots: Spot[]): Spots =>
	newSortedSpots(sortSpots(spots))

export const todaySpots = (now: number, spots: Spots): Spots =>
	sliceByTime(now, endOfDayTime(now), spots)

const sliceByTime = (start: number, end: number, spots: Spots): Spots => {
	console.log(
		start,
		end,
		spots.order.length,
		firstNextSpot(start, spots),
		firstNextSpot(end, spots) + 1
	)
	return newSortedSpots(
		slice(
			firstNextSpot(start, spots),
			firstNextSpot(end, spots) + 1,
			spots.order
		)
	)
}

const sortSpots = sort<Spot>((a, b) => a.time - b.time)

const firstNextSpot = (time: number, spots: Spots): number =>
	findIndex(curry(isActiveSpot)(time), spots.order)

const isActiveSpot = (now: number, spot: Spot): boolean =>
	now < spot.time + spot.duration

const endOfDayTime = (now: number) => dayjs(now).endOf('day').valueOf()

export const isCurrentSpot = (now: number, { time, duration }: Spot): boolean =>
	now > time && now < time + duration
