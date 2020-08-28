import { sort, curry, slice, findIndex } from 'rambda'
import dayjs from 'dayjs'

export interface Spot {
	id: string
	time: number
	duration: number
}

export interface Spots<T> {
	todaySpots: (now: number) => Spots<T>
	get: () => T[]
}

const createIndex = <T extends Spot>(spots: T[]) => {
	const index = spots.reduce(
		(p, c, i) => p.set(c.id, i),
		new Map<string, number>()
	)
	return (id: string) => index.get(id)
}

const spotsDistance = (before: Spot, after: Spot) =>
	after.time - (before.time + before.duration)

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

export const newSpots = <T extends Spot>(tasks: T[]) => {
	const spots = sortSpots(tasks)
	const getIndex = createIndex(spots)

	const sliceByTime = (start: number, end: number): Spots<T> =>
		newSpots(
			slice(firstNextSpot(start, spots), firstNextSpot(end, spots) + 1, spots)
		)

	//TODO do something with this ugly checks (do not validate - parse)
	const next = (spot: T): T | undefined => {
		const index = getIndex(spot.id)
		if (index === undefined) {
			return
		}

		if (spots.length <= index + 1) {
			return
		}

		return spots[index + 1]
	}

	return {
		//todaySpots returns spots from now to end of the day
		todaySpots: (now: number): Spots<T> => sliceByTime(now, endOfDayTime(now)),
		get: (): T[] => spots,
		next,
	}
}

const sortSpots = <T extends Spot>(list: T[]): T[] =>
	sort((a: T, b: T) => a.time - b.time, list)

const firstNextSpot = (time: number, spots: Spot[]): number =>
	findIndex(curry(isActiveSpot)(time), spots)

const isActiveSpot = (now: number, spot: Spot): boolean =>
	now < spot.time + spot.duration

const endOfDayTime = (now: number) => dayjs(now).endOf('day').valueOf()

export const isCurrentSpot = (now: number, { time, duration }: Spot): boolean =>
	now > time && now < time + duration
