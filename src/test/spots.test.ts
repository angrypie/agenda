import { stubTasks } from 'models/root'
import { newSpots } from 'lib/spots'
import { treeToSpots, NewRootNode } from 'lib/spots/tree'

const tasks = stubTasks

test('create new spots', () => {
	const spots = newSpots(tasks)
	const arr = spots.get()

	tasks.forEach(task => {
		const spot = arr.find(({ id }) => task.id === id)
		expect(spot).toBeDefined()
		expect(task).toEqual(spot)
	})

	const root = NewRootNode(tasks)

	const treeSpots = treeToSpots(root)

	expect(treeSpots.length).toBe(arr.length)
	arr.forEach((spot, i) => expect(spot).toEqual(treeSpots[i]))
})

test('spots tree to flat array', () => {
	const root = NewRootNode(tasks)
	tasks.forEach(task => {
		const node = root.childs.find(child => task.id === child.spot.id)
		expect(node).toBeDefined()
		expect(task).toEqual(node)
	})
})
