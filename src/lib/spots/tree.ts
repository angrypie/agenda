import { Spot, timeSpanEnd, gapsBetweenSpots } from './spot'

interface Node {
	spot: Spot
	childs: Node[]
}

export const NewNode = (spot: Spot, childs: Node[] = []): Node => ({
	spot,
	childs,
})

export const treeToSpots = ({ spot, childs }: Node): Spot[] => {
	const spots = NewNotEmptyArray(childs.flatMap(treeToSpots))
	if (spots === undefined) {
		return [spot]
	}

	const [before, after] = splitSpot(
		spot,
		head(spots).time,
		timeSpanEnd(last(spots))
	)

	const gaps = gapsBetweenSpots(spots)
	const withGaps = spots.flatMap((spot, index) => {
		const arr: Spot[] = [spot]
		const gap = gaps(index)
		if (gap !== 0) {
			arr.push({
				id: spot.id + '+gap',
				name: 'Free time',
				duration: gap,
				time: timeSpanEnd(spot),
			})
		}
		return arr
	})

	return [before, ...withGaps, after]
}

const splitSpot = (spot: Spot, start: number, end: number): [Spot, Spot] => [
	{ ...spot, id: `${spot.id}+before`, duration: start },
	{ ...spot, id: `${spot.id}+after`, time: end },
]

export const NewRootNode = (spots: Spot[] = []): Node =>
	NewNode(
		{
			id: 'root',
			name: 'Root',
			time: 0,
			duration: Infinity,
		},
		spots.map(spot => NewNode(spot))
	)

const NewNotEmptyArray = <T>(arr: T[]): Arr<T> | undefined =>
	arr.length === 0 ? undefined : [arr[0], ...arr.slice(1)]

const head = <T>(arr: Arr<T>): T => arr[0]
const last = <T>(arr: Arr<T>): T => arr[arr.length - 1]

type Arr<T> = [T, ...T[]]
