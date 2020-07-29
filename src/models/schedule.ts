import { types, Instance } from 'mobx-state-tree'

export const Task = types
	.model({
		id: types.string,
		name: types.string,
		time: types.number,
		duration: types.number,
	})
	.actions(self => ({
		active(): boolean {
			const { duration, time } = self
			//TODO use Date.now() instead of stub
			//const currentTime = Date.now()
			const currentTime = 1595970000 + 12 * 3600
			return currentTime > time && currentTime < time + duration
		},
	}))

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
	})
	.actions(self => ({
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
		currentTasks(): ITask[] {
			return self.tasks.filter(task => task.active())
		},
	}))

export interface ITask extends Instance<typeof Task> {}
