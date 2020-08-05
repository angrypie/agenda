import { types, Instance } from 'mobx-state-tree'
import { isCurrentSpot, newSpots } from 'lib/spots'

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
		tasks: types.optional(types.array(Task), []),
		todayTasks: types.optional(
			types.array(types.safeReference(Task, { acceptsUndefined: false })),
			[]
		),
		currentTask: types.safeReference(Task),
	})
	.actions(function (self) {
		return {
			update(now: number) {
				//Set Active tasks
				self.tasks.forEach(task => task.setActive(isCurrentSpot(now, task)))
				const spots = newSpots(self.tasks.slice())
				//Set today tasks
				self.todayTasks.replace(spots.todaySpots(now).get())
				//Set current task
				self.currentTask = self.tasks.find(task => task.active)
			},

			getNextTask(task: ITask): ITask | void {
				return newSpots(self.tasks.slice()).next(task)
			},
		}
	})
