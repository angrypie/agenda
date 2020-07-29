import { types, Instance } from 'mobx-state-tree'

export const Task = types
	.model({
		id: types.string,
		name: types.string,
		time: types.string,
	})
	.views(self => ({
		get active(): boolean {
			return Number(self.time.split(':')[0]) === new Date().getHours()
		},
	}))

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
	})
	.views(self => ({
		get currentTasks(): ITask[] {
			return self.tasks.filter(task => task.active)
		},
	}))
	.actions(self => ({
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
	}))

export interface ITask extends Instance<typeof Task> {}
