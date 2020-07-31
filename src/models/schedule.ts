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
		currentId: types.optional(types.integer, -1),
	})
	.actions(self => ({
		update() {
			this.setCurrentTasks()
		},
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
		setCurrentTasks() {
			self.currentId = self.tasks.findIndex(task => task.active())
			console.log('set', self.currentId)
		},
		getNextTask(task: ITask): ITask | void {
			const index = self.tasks.findIndex(t => t.id === task.id)
			return self.tasks[index + 1]
		},
	}))
