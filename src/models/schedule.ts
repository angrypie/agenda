import { types, Instance } from 'mobx-state-tree'

export const Task = types.model({
	id: types.string,
	name: types.string,
	time: types.string,
	active: types.boolean,
})

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
	})
	.actions(self => ({
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
	}))
