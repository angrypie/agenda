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
		tasks: types.optional(types.map(Task), {}),
		plans: types.optional(types.map(Plan), {}),
	})
	.actions(function (self) {
		let spots = newSpots(Array.from(self.tasks.values()))
		const matcher = newMatcher<ITask>()
		if (!self.plans.has(FreeSpotPlan.id)) {
			self.plans.put(FreeSpotPlan)
		}
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
				const id = uuidv4()
				self.plans.put({ name, id })
			},

			updateTask(spot: Spot, plan: IPlan): boolean {
				const task = self.tasks.get(spot.id)
				const { id, name } = plan
				if (task === undefined) {
					self.tasks.put({ ...spot, name, plan: id, id: uuidv4() })
				} else {
					if (plan.id === FreeSpotPlan.id) {
						self.tasks.delete(task.id)
					} else {
						self.tasks.put({ ...task, ...spot, name, plan: id })
					}
				}
				spots = newSpots(Array.from(self.tasks.values()))
				return true
			},
		}
	})
