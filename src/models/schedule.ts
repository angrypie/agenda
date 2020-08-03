import { types, Instance } from 'mobx-state-tree'

export const Task = types
	.model({
		id: types.identifier,
		name: types.string,
		time: types.number,
		duration: types.number,
		active: types.optional(types.boolean, false),
	})
	.actions(self => ({
		setActive(active: boolean) {
			self.active = active
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
		setTodayTasks(tasks: ITask[]) {
			self.todayTasks.replace(tasks)
		},
		addTask(task: ITask) {
			//TODO find in sorted array where to put new item
			self.tasks.push(task)
		},
		setCurrentTask(task: ITask | undefined) {
			self.currentTask = task
		},
		//TODO use spots list to find next task
		getNextTask(task: ITask): ITask | void {
			const { todayTasks } = self
			const nextIndex = todayTasks.findIndex(t => t.id === task.id) + 1
			console.log(nextIndex, todayTasks.length)
			if (todayTasks.length <= nextIndex) {
				return
			}
			return todayTasks[nextIndex]
		},
	}))
