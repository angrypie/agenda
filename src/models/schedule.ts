import { types, Instance } from 'mobx-state-tree'
import { isCurrentSpot, newSpots, Spot } from 'lib/spots'
import { getDayStart } from 'lib/time'
import { newMatcher } from 'lib/labels'

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
		const spots = newSpots(self.tasks.slice())
		const matcher = newMatcher<ITask>()
		return {
			update(now: number) {
				//Set Active tasks
				self.tasks.forEach(task => task.setActive(isCurrentSpot(now, task)))
				self.todayTasks.replace(spots.todaySpots(now).underlyingList())
				self.currentTask = self.tasks.find(task => task.active)
			},

			suggestByTime(time: number): ITask[] {
				return matcher.match(time)
			},

			getDayTask(time: number): Spot[] {
				return spots.todaySpots(getDayStart(time)).get()
			},

			getCurrentSpot(time: number): Spot | undefined {
				return spots.get().find(task => isCurrentSpot(time, task))
			},

			getNextTask(time: number): Spot | undefined {
				return spots.next(time)
			},

			//TODO Add Plan to plan backlog
			addPlan(name: string) {
				console.log('TODO: add-task -> add plan:', name)
			},
		}
	})
