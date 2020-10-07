import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { getDayStart } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'

export const Task = types.model({
	id: types.identifier,
	name: types.string,
	time: types.number,
	duration: types.number,
})

export const Plan = types.model({
	id: types.identifier,
	name: types.string,
})

export interface ITask extends Instance<typeof Task> {}
export interface IPlan extends Instance<typeof Plan> {}

export const Schedule = types
	.model({
		tasks: types.optional(types.array(Task), []),
		plans: types.optional(types.array(Plan), []),
	})
	.actions(function (self) {
		let spots = newSpots(self.tasks.slice())
		const matcher = newMatcher<ITask>()
		return {
			suggestByTime(time: number): ITask[] {
				return matcher.match(time)
			},

			getDayTask(time: number): Spot[] {
				return spots.todaySpots(getDayStart(time))
			},

			getCurrentSpot(time: number): Spot {
				return spots.current(time)
			},

			getNextTask(time: number): Spot {
				return spots.next(time)
			},

			addPlan(name: string) {
				self.plans.unshift({ name, id: uuidv4() })
			},

			updateTask(spot: Spot): boolean {
				const index = self.tasks.findIndex(({ id }) => id === spot.id)
				if (index === -1) {
					self.tasks.push({ ...spot, id: uuidv4() })
				} else {
					self.tasks[index].name = spot.name
				}
				spots = newSpots(self.tasks.slice())
				return true
			},
		}
	})
