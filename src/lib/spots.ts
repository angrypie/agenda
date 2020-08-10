import { sort, curry, slice, findIndex } from 'rambda'
import dayjs from 'dayjs'

const createIndex = <T extends Spot>(spots: T[]) => {
	const index = spots.reduce(
		(p, c, i) => p.set(c.id, i),
		new Map<string, number>()
	)
	return (id: string) => index.get(id)
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

export interface Spot {
	id: string
	time: number
	duration: number
}

export interface Spots<T> {
	todaySpots: (now: number) => Spots<T>
	get: () => T[]
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
