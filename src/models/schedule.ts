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
			const now = dayjs().valueOf()
			return now > time && now < time + duration
		},
	}))

export interface ITask extends Instance<typeof Task> {}

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
		current: types.optional(types.array(Task), []),
	})
	.actions(self => ({
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
		setCurrentTasks() {
			const filtered = self.tasks.filter(task => task.active())
			if (filtered.length !== 0) {
				self.current.push(filtered[0])
			}
		},
		getNextTask(task: ITask): ITask | void {
			const index = self.tasks.findIndex(t => t.id === task.id)
			return self.tasks[index + 1]
		},
	}))
