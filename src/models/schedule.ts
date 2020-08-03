import { types, Instance, cast } from 'mobx-state-tree'
import { getEnv } from './utils'

export const Task = types
	.model({
		id: types.identifier,
		name: types.string,
		time: types.number,
		duration: types.number,
	})
	.actions(self => ({
		active(): boolean {
			const now = getEnv(self).getUnixTimeMs()
			const { duration, time } = self
			return now > time && now < time + duration
		},
	}))

export interface ITask extends Instance<typeof Task> {}

export const Schedule = types
	.model({
		//TODO use spots structure to manage taken and available
		//time spots for tasks.
		tasks: types.optional(types.array(Task), []),
		todayTasks: types.optional(
			types.array(types.safeReference(Task, { acceptsUndefined: false })),
			[]
		),
		currentTask: types.safeReference(Task),
	})
	.actions(self => ({
		//TODO use external spots manager to update tasks state
		update() {
			const now = getEnv(self).getUnixTimeMs()
			const tasks = self.tasks
				.slice()
				.filter(t => t.time + t.duration > now)
				.sort((a, b) => a.time - b.time)
			self.todayTasks.replace(tasks)
			this.setCurrentTasks()
		},
		addTask(task: Instance<typeof Task>) {
			//TODO find in sorted array where to put new item
			self.tasks.push(task)
		},
		setCurrentTasks() {
			self.currentTask = self.tasks.find(task => task.active())
		},
		//TODO use spots list to find next task
		getNextTask(task: ITask): ITask | void {
			const nextIndex = self.tasks.findIndex(t => t.id === task.id) + 1
			if (self.tasks.length >= nextIndex) {
				return
			}
			return self.tasks[nextIndex]
		},
	}))
