import { Spot, timeSpanEnd, gapsBetweenSpots, NewFreeSpot } from './spot'
import { Arr, head, last, NewNotEmptyArray } from 'lib/collections'

const rootNodeId = 'root.id.Aed1vahX'

interface Node {
	spot: Spot
	parent: (() => Node) | undefined
	childs: Node[]
}

export const NewNode = (spot: Spot, childs: Node[] = []): Node => {
	const parent: Node = {
		spot,
		parent: undefined,
		childs: childs.map(child => ({ ...child, parent: () => parent })),
	}
	return parent
}

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
			arr.push(
				NewFreeSpot({
					id: spot.id + '+gap',
					duration: gap,
					time: timeSpanEnd(spot),
				})
			)
		}
		return arr
	})

	return [before, ...withGaps, after]
}

export const availableTimeSpan = (node: Node): [number, number] => {
	const { parent } = node
	if (parent === undefined) {
		return [0, 0]
	}
	const nodes = parent().childs
	const index = nodes.findIndex(n => node.spot.id === n.spot.id)
	if (index < 0) {
		throw Error('cant find spot in childs list')
	}
	const left = nodes[index - 1]
	const right = nodes[index + 1]

	return [
		left === undefined ? 0 : timeSpanEnd(left.spot),
		right === undefined ? 0 : right.spot.time,
	]
}

const splitSpot = (spot: Spot, start: number, end: number): [Spot, Spot] => [
	{ ...spot, id: `${spot.id}+before`, duration: start },
	{ ...spot, id: `${spot.id}+after`, time: end },
]

//findNodeDeep try to find node with given id in whole tree.
//If node is not found returns root node
export const findNodeDeep = (root: Node, id: string): Node => {
	if (root.spot.id === id) {
		return root
	}
	for (const child of root.childs) {
		const node = findNodeDeep(child, id)
		if (node.spot.id === id) {
			return node
		}
	}
	return root
}

export const NewRootNode = (spots: Spot[] = []): Node =>
	NewNode(
		NewFreeSpot({
			id: rootNodeId,
			time: 0,
			duration: Infinity,
		}),
		spots.map(spot => NewNode(spot))
	)

export const isRootSpot = (spot: Spot): boolean =>
	spot.time === 0 || spot.duration === Infinity
