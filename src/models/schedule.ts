import { types, Instance } from 'mobx-state-tree'
import dayjs from 'dayjs'

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
			const now = dayjs().unix()
			return now > time && now < time + duration
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
