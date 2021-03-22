import {
	Spot,
	NewTimeSpanDuration,
	gapsBetweenSpots,
	NewFreeSpot,
	TimeSpan,
	NewTimeSpan,
	timeSpanIntersection,
	timeSpanInclusion,
} from './spot'
import {
	Arr,
	concat,
	flatMap,
	head,
	last,
	NewNotEmptyArray,
} from 'lib/collections'

const rootNodeId = 'root.id.Aed1vahX'

export interface Node {
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

	const gaps = gapsBetweenSpots(spots)
	const withGaps = flatMap(
		(arr, index) => concat(arr, createFreeSpotGap(head(arr), gaps(index))),
		spots
	)

	const [before, after] = splitSpot(spot, head(spots).time, last(spots).end)
	withGaps.unshift(...before)
	withGaps.push(...after)

	return withGaps
}

const createFreeSpotGap = (child: Spot, gap: number): [] | [Spot] =>
	gap === 0
		? []
		: [
				NewFreeSpot({
					id: `${child.id}+gap`,
					...NewTimeSpanDuration(child.end, gap).get(),
				}),
		  ]

export const availableTimeSpan = (node: Node): [number, number] => {
	console.log('available node', node)
	const { parent } = node
	if (parent === undefined) {
		console.warn('availableTimeSpan: parent is undefined')
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

const splitSpot = (
	spot: Spot,
	start: number,
	end: number
): [[Spot] | [], [Spot] | []] => [
	spot.time !== start
		? [{ ...NewTimeSpan(spot).setEnd(start).get(), id: `${spot.id}+before` }]
		: [],
	spot.end !== end
		? [{ ...NewTimeSpan(spot).setTime(end).get(), id: `${spot.id}+after` }]
		: [],
]

//findNodeDeep try to find node with given id in whole tree.
//If node is not found returns root node
export const findNodeById = (root: Node, id: string): Node => {
	return findNode(root, spot => spot.id === id)
}
//
//findNodeDeep try to find node with given timespan in whole tree.
//If node is not found returns root node
export const findNodeByTime = (root: Node, timespan: TimeSpan): Node => {
	return findNode(root, spot => timeSpanInclusion(spot, timespan))
}
//
//findNode try to find node in whole tree using test callback.
//If node is not found returns root node
export const findNode = (root: Node, test: (spot: Spot) => boolean): Node => {
	if (test(root.spot)) {
		return root
	}
	for (const child of root.childs) {
		const node = findNode(child, test)
		if (test(node.spot)) {
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
export const sliceTreeByTime = (root: Node, timespan: TimeSpan): Node => {
	const childs = root.childs
		.filter(node => timeSpanIntersection(node.spot, timespan))
		.map(({ spot }) => NewNode(spot))

	//Expand root timespan if childs out of provider range
	const tt = NewTimeSpan(timespan).modify(ts => {
		if (childs.length !== 0) {
			const childsStart = childs[0].spot.time
			const childsEnd = childs[childs.length - 1].spot.end

			return ts
				.setTime(firstIfTrue(childsStart, ts.time(), (a, b) => a < b))
				.setEnd(firstIfTrue(childsEnd, ts.timeEnd(), (a, b) => a > b))
		}
		return ts
	})

	return NewNode(NewFreeSpot({ id: rootNodeId, ...tt.get() }), childs)
}

const firstIfTrue = <T>(a: T, b: T, compare: (x: T, y: T) => boolean): T =>
	compare(a, b) ? a : b
