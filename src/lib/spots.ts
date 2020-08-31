import { sort, curry, slice, findIndex } from 'rambda'
import { endOfDayTime } from 'lib/time'

export interface Spot extends TimeSpan {
	id: string
	name: string
}

export interface Spots<T> {
	todaySpots: (now: number) => Spot[]
	get: () => Spot[]
	underlyingList: () => T[]
	next: (now: number) => Spot | undefined
}

export const newSpots = <T extends Spot>(tasks: T[]): Spots<T> => {
	const spots = sortSpots(tasks)

	const getSpots = (): Spot[] => {
		const gaps = gapsBetweenSpots(spots)
		const arr = spots.flatMap((spot, index) => {
			const arr: Spot[] = [spot]
			const gap = gaps(index)
			if (gap !== 0) {
				arr.push({
					id: spot.id + 'gap',
					name: 'Free time',
					duration: gap,
					time: spot.time + spot.duration,
				})
			}
			return arr
		})
		const last = arr[arr.length - 1]
		arr.push({
			id: 'endoftime',
			name: 'End Gap',
			duration: Infinity,
			time: arr.length === 0 ? 0 : last.time + last.duration,
		})
		if (last !== undefined) {
			arr.unshift({
				id: 'startoftime',
				name: 'Start Gap',
				duration: arr[0].time,
				time: 0,
			})
		}

		return arr
	}

	//TODO do something with this ugly checks (do not validate - parse)
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
		underlyingList: (): T[] => spots,
		next,
	}
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

const sortSpots = <T extends Spot>(list: T[]): T[] =>
	sort((a: T, b: T) => a.time - b.time, list)

const firstNextSpot = (time: number, spots: Spot[]): number =>
	findIndex(curry(isActiveSpot)(time), spots)

//isActiveSpot return true if spot is not end yet
const isActiveSpot = (now: number, spot: TimeSpan): boolean =>
	now < spot.time + spot.duration

//isCurrentSpot return true if spot belong to current time
interface TimeSpan {
	time: number
	duration: number
}
export const isCurrentSpot = (now: number, t: TimeSpan): boolean =>
	now > t.time && now < t.time + t.duration
