import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { NewTime } from 'lib/time'
import { newMatcher } from 'lib/labels'
import { v4 as uuidv4 } from 'uuid'
import {
	FreeSpotPlan,
	NewSleepSpot,
	SleepSpotPlan,
	TimeSpan,
	timeSpanInclusion,
} from 'lib/spots/spot'
import { Arr, head, last } from 'lib/collections'
import { pipe } from 'rambda'

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
					const day = siblingDaysSpan(time, 0)
					const siblingDays = minSufficientSiblingDays(time)
					return pipe(
						spots().slice,
						buff => buff.concat(createSuggestedTasks(buff)),
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
						buff => buff.concat(createSuggestedTasks(buff)),
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

	for (const s of spots) {
		//Add sleep task to first free spot that fits 8h time span
		if (s.plan !== FreeSpotPlan.id || !fitsForSleep(s)) {
			continue
		}

		//TODO suggest sleep span by smart suggsetion engine
		const t = NewTime(s.time).dayStart().add(23, 'hours')
		const sleepSpan = {
			time: t.value(),
			end: t.add(8, 'hours').value(),
		}
		//If sleep span not suite for selected spot
		if (!timeSpanInclusion(sleepSpan, s)) {
			continue
		}

		const sleepSpot = NewSleepSpot({ ...sleepSpan, id: uuidv4() })
		return [
			...createSuggestedTasks(
				newSpots([...spots, sleepSpot]).slice(wholeTimeSpan)
			),
			sleepSpot,
		]
	}

	return []
}

const minSufficientSiblingDays = (todayTime: number): TimeSpan =>
	siblingDaysSpan(todayTime, 2)

const siblingDaysSpan = (todayTime: number, n: number): TimeSpan =>
	pipe(NewTime, t => ({
		time: t.subtract(n, 'day').dayStart().value(),
		end: t.add(n, 'day').dayEnd().value(),
	}))(todayTime)
