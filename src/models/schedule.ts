import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { getDayStart } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'

export const FreeSpotPlan = {
	id: 'free-spot',
	name: 'Free spot',
}

export const Plan = types.model({
	id: types.identifier,
	name: types.string,
})

export const Task = types.model({
	id: types.identifier,
	plan: types.reference(Plan),
	name: types.string,
	time: types.number,
	duration: types.number,
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

			updateTask(spot: Spot, plan: IPlan): boolean {
				const index = self.tasks.findIndex(({ id }) => id === spot.id)
				const { id, name } = plan
				if (index === -1) {
					self.tasks.push({ ...spot, name, plan: id, id: uuidv4() })
				} else {
					self.tasks[index].name = plan.name
					self.tasks[index].plan = plan
				}
				spots = newSpots(self.tasks.slice())
				return true
			},
		}
	})
