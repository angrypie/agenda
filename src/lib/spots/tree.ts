import { Spot, timeSpanEnd } from '.'

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
	return [before, ...spots, after]
}

const splitSpot = (spot: Spot, start: number, end: number): [Spot, Spot] => [
	{ ...spot, id: `${spot.id}+before`, duration: start },
	{ ...spot, id: `${spot.id}+after`, time: end },
]

const NewNotEmptyArray = <T>(arr: T[]): Arr<T> | undefined =>
	arr.length === 0 ? undefined : [arr[0], ...arr.slice(1)]

const head = <T>(arr: Arr<T>): T => arr[0]
const last = <T>(arr: Arr<T>): T => arr[arr.length - 1]

type Arr<T> = [T, ...T[]]
