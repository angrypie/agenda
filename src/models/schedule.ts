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

export const Clock = types
	.model({
		now: types.optional(types.integer, () => dayjs().valueOf()),
	})
	.actions(self => ({
		update() {
			self.now = dayjs().valueOf()
		},
	}))
	.actions(function (self) {
		let timer: any

		return {
			afterCreate() {
				timer = setInterval(() => self.update(), 1000)
			},
			beforeDestroy() {
				clearInterval(timer)
			},
		}
	})

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
		clock: Clock,
	})
	.actions(self => ({
		addTask(task: Instance<typeof Task>) {
			self.tasks.push(task)
		},
		currentTasks(): ITask[] {
			return self.tasks.filter(task => task.active())
		},
	}))
