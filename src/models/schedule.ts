import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { formatDate, formatTime, getDayStart, NewTime } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'
import { FreeSpotPlan, SleepSpotPlan, TimeSpan } from 'lib/spots/spot'
import { Arr, head, last } from 'lib/collections'

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
		self.plans.put(SleepSpotPlan)
		return {
			views: {
				getDayTasks(time: number): Spot[] {
					const dayStart = getDayStart(time)
					return spots(
						createSuggestedTasks(
							spots().slice({
								time: NewTime(dayStart).subtract(1, 'day').dayStart().value(),
								end: NewTime(dayStart).add(1, 'day').dayEnd().value(),
							})
						)
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

				getPlan(id: string): IPlan | undefined {
					return self.plans.get(id)
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

const createSuggestedTasks = (spots: Arr<Spot>): Spot[] => {
	const wholeTimeSpan = {
		time: head(spots).time,
		end: last(spots).end,
	}
	const sleepDuration = 288e5
	const fitsForSleep = ({ time, end }: TimeSpan) => end - time >= sleepDuration
	const inject: Spot[] = []

	for (const s of spots) {
		//Add sleep task to first free spot that fits 8h time span
		if (s.plan === FreeSpotPlan.id && fitsForSleep(s)) {
			const sleepSpan = {
				time: NewTime(s.time).dayStart().add(23, 'hours').value(),
				end: NewTime(s.time)
					.dayStart()
					.add(23 + 8, 'hours')
					.value(),
			}
			if (s.time <= sleepSpan.time && s.end >= sleepSpan.end) {
				const sleepSpot = {
					...sleepSpan,
					id: uuidv4(),
					name: SleepSpotPlan.name,
					plan: SleepSpotPlan.id,
				}
				inject.push(
					...createSuggestedTasks(
						newSpots([
							...spots.filter(spot => spot.plan !== FreeSpotPlan.id),
							sleepSpot,
						]).slice(wholeTimeSpan)
					)
				)
				inject.push(sleepSpot)
			}
		}
	}

	return inject
}
