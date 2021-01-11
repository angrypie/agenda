import { Spot, timeSpanEnd, gapsBetweenSpots } from './spot'
import { Arr, head, last, NewNotEmptyArray } from 'lib/collections'

interface Node {
	spot: Spot
	childs: Node[]
}

export const NewNode = (spot: Spot, childs: Node[] = []): Node => ({
	spot,
	childs,
})

export const treeToSpots = ({ spot, childs }: Node): Arr<Spot> => {
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
		const arr = [spot]
		const gap = gaps(index)
		if (gap !== 0) {
			arr.push({
				id: spot.id + '+gap',
				name: 'Free spot',
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
			name: 'Free spot(root)',
			time: 0,
			duration: Infinity,
		},
		spots.map(spot => NewNode(spot))
	)

export const isRootSpot = (spot: Spot): boolean =>
	spot.time === 0 || spot.duration === Infinity
