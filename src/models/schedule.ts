import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { getDayStart } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'
import { observe } from 'mobx'
import { FreeSpotPlan } from 'lib/spots/spot'

export const Plan = types.model({
	id: types.identifier,
	name: types.string,
})

export const Task = types.model({
	id: types.identifier,
	plan: types.reference(Plan),
	name: types.string,
	time: types.number,
	end: types.number,
})

export interface ITask extends Instance<typeof Task> {}
export interface IPlan extends Instance<typeof Plan> {}

export const Schedule = types
	.model({
		tasks: types.optional(types.map(Task), {}),
		plans: types.optional(types.map(Plan), {}),
	})
	.extend(function (self) {
		const recreateSpots = () =>
			newSpots(
				Array.from(self.tasks.values()).map(spot => ({
					...spot,
					plan: spot.plan.id,
				}))
			)
		let spotsCache = recreateSpots()
		const updateSpots = () => (spotsCache = recreateSpots())

		//TODO find another way to triger spots views
		const spots = () => (self.tasks.size === 0 ? spotsCache : spotsCache)

		observe(self.tasks, change => {
			console.log('TODO reduce spots update', change.name, change.type)
			updateSpots()
		})

		const matcher = newMatcher<ITask>()
		if (!self.plans.has(FreeSpotPlan.id)) {
			self.plans.put(FreeSpotPlan)
		}
		return {
			views: {
				getDayTasks(time: number): Spot[] {
					return spots().todaySpots(getDayStart(time))
				},
				getCurrentSpot(time: number): Spot {
					return spots().current(time)
				},

				getTaskGaps(task: ITask): [number, number] {
					return spots().daySpotGaps({ ...task, plan: task.plan.id })
				},

				getNextTask(time: number): Spot {
					return spots().next(time)
				},
			},
			actions: {
				suggestByTime(time: number): ITask[] {
					return matcher.match(time)
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
					updateSpots()
					return true
				},
			},
		}
	})
