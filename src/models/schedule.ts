import { types, Instance } from 'mobx-state-tree'
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
		currentTask: types.safeReference(Task),
	})
	.views(self => ({
		get todayTasks(): ITask[] {
			return self.tasks.slice().sort((a, b) => a.time - b.time)
		},
	}))
	.actions(self => ({
		update() {
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
			const index = self.tasks.findIndex(t => t.id === task.id)
			return self.tasks[index + 1]
		},
	}))
