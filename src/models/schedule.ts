import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { getDayStart } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'
import { FreeSpotPlan } from 'lib/spots/spot'

const SleepSpotPlan = { id: 'sleep-spot', name: 'Sleep_s' }

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
		//TODO [perfomance] do not create spots each time or is mobx may cache it?
		const spots = (inject: Spot[] = []) =>
			newSpots(
				Array.from(self.tasks.values())
					.map(spot => ({
						...spot,
						plan: spot.plan.id,
					}))
					.concat(inject)
			)

		const matcher = newMatcher<ITask>()
		self.plans.put(FreeSpotPlan)
		self.plans.put(SleepSpotPlan)
		return {
			views: {
				getDayTasks(time: number): Spot[] {
					const dayStart = getDayStart(time)
					return spots(
						createSuggestedTasks(spots().todaySpots(dayStart))
					).todaySpots(dayStart)
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
					return true
				},
			},
		}
	})

const createSuggestedTasks = (spots: Spot[]): Spot[] => {
	const sleepDuration = 216e5
	const spot = spots.find(
		s => s.plan === FreeSpotPlan.id && s.end - s.time >= sleepDuration
	)
	if (spot === undefined) {
		return []
	}
	const sleepSpot = {
		...spot,
		id: uuidv4(),
		end: spot.time + sleepDuration,
		name: SleepSpotPlan.name,
		plan: SleepSpotPlan.id,
	}
	return [sleepSpot]
}
