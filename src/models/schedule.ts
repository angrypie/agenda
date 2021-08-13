import { types, Instance } from 'mobx-state-tree'
import { newSpots, siblingDaysSpan, Spot } from 'lib/spots'
import { newMatcher } from 'lib/matcher'
import { v4 as uuidv4 } from 'uuid'
import { FreeSpotPlan, SleepSpotPlan, TimeSpan } from 'lib/spots/spot'
import { pipe } from 'rambda'
import { newSpotsRepository } from 'lib/repository'

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
		const fullTasksArray = () =>
			Array.from(self.tasks.values()).map(spot => ({
				...spot,
				plan: spot.plan.id,
			}))
		//TODO [perfomance] do not create spots each time or is mobx may cache it?
		const spots = (inject: Spot[] = []) =>
			newSpots(fullTasksArray().concat(inject))

		const spotsRepository = newSpotsRepository(fullTasksArray)
		//TODO request historic data from Storage Repository
		const matcher = newMatcher<Spot>(spotsRepository)
		self.plans.put(SleepSpotPlan)
		return {
			views: {
				getDayTasks(time: number): Spot[] {
					const day = siblingDaysSpan(time, 0)
					const siblingDays = minSufficientSiblingDays(time)
					return pipe(
						spots().slice,
						matcher.createSuggestedTasks,
						newSpots,
						s => {
							const buff = s.get()
							const wake = buff.find(
								({ end, plan }) =>
									end >= day.time && end <= day.end && plan === SleepSpotPlan.id
							)
							const bedtime = buff.find(
								({ end, plan }) =>
									end >= day.end &&
									end <= siblingDays.end &&
									plan === SleepSpotPlan.id
							)

							return s.slice({
								time: wake === undefined ? day.time : wake.end,
								end: bedtime === undefined ? day.end : bedtime.time,
							})
						}
					)(siblingDays)
				},

				getCurrentSpot(time: number): Spot {
					return spots().current(time)
				},

				getTaskGaps(spot: Spot): [number, number] {
					return pipe(
						minSufficientSiblingDays,
						spots().slice,
						matcher.createSuggestedTasks,
						newSpots
					)(spot.time).daySpotGaps(spot)
				},

				getNextTask(time: number): Spot {
					return spots().next(time)
				},

				getPlan(id: string): IPlan | undefined {
					return self.plans.get(id)
				},
			},
			actions: {
				suggestByTime(time: number): Spot[] {
					return matcher.match(time)
				},

				addPlan(name: string) {
					const id = uuidv4()
					self.plans.put({ name, id })
				},

				removePlan(id: string) {
					self.plans.delete(id)
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
					return true
				},
			},
		}
	})

const minSufficientSiblingDays = (todayTime: number): TimeSpan =>
	siblingDaysSpan(todayTime, 2)
