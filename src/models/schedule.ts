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
		//TODO use spots structure to manage taken and available
		//time spots for tasks.
		tasks: types.optional(types.array(Task), []),
		currentTask: types.safeReference(Task),
	})
	.actions(self => ({
		afterCreate() {
			self.tasks = self.tasks.sort((a, b) => a.time - b.time)
		},
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
