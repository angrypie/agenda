import {
	Spot,
	NewTimeSpanDuration,
	gapsBetweenSpots,
	NewFreeSpot,
	TimeSpan,
	NewTimeSpan,
} from './spot'
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

	const [before, after] = splitSpot(spot, head(spots).time, last(spots).end)

	const gaps = gapsBetweenSpots(spots)
	const withGaps = spots.flatMap((spot, index) => {
		const arr = [spot]
		const gap = gaps(index)
		if (gap !== 0) {
			arr.push(
				NewFreeSpot({
					id: spot.id + '+gap',
					...NewTimeSpanDuration(spot.end, gap).get(),
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
		left === undefined ? parent().spot.time : left.spot.end,
		right === undefined ? parent().spot.end : right.spot.time,
	]
}

const splitSpot = (spot: Spot, start: number, end: number): [Spot, Spot] => [
	{ ...NewTimeSpan(spot).setEnd(start).get(), id: `${spot.id}+before` },
	{ ...NewTimeSpan(spot).setTime(end).get(), id: `${spot.id}+after` },
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
			end: Infinity,
		}),
		spots.map(spot => NewNode(spot))
	)

//sliceTreeByTime returns root with childrens related to given timespan
export const sliceTreeByTime = (root: Node, timespan: TimeSpan): Node =>
	NewNode(
		NewFreeSpot({ id: rootNodeId, ...timespan }),
		root.childs
			.filter(node => timeSpanItersection(node.spot, timespan))
			.map(({ spot }) => NewNode(spot))
	)

//timeSpanIntersection checks intersection of two time intervals
export const timeSpanItersection = (a: TimeSpan, b: TimeSpan) =>
	a.time < b.end && b.time < a.end
