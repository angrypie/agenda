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
		now: types.optional(types.Date, () => new Date()),
	})
	.actions(self => {
		let timer: any
		const start = () => {
			timer = setInterval(() => {
				;(self as any).update()
			}, 1000)
		}
		const afterCreate = () => {
			self.now = new Date(Date.now())
		}
		const beforeDestroy = () => {
			clearInterval(timer)
		}
		return { start, stop: beforeDestroy, update: afterCreate }
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
