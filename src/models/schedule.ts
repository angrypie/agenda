import { types, Instance } from 'mobx-state-tree'
import { newSpots, Spot } from 'lib/spots'
import { getDayStart, NewTime } from 'lib/time'
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
				//TODO decide how to slice day spots based on sleep spots around day-start/end
				getDayTasks(time: number): Spot[] {
					return pipe(
						siblingDaysSpan,
						spots().slice,
						buff => buff.concat(createSuggestedTasks(buff)),
						newSpots,
						s => {
							const buff = s.get()
							const sleeps: number[] = buff.reduce(
								(acc, spot, i) =>
									spot.plan === SleepSpotPlan.id ? acc.concat([i]) : acc,
								[] as number[]
							)
							return s.get().slice(sleeps[0], sleeps[1] + 1)
						}
					)(time)
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

const siblingDaysSpan = (todayTime: number, n: number = 1): TimeSpan =>
	pipe(NewTime, t => ({
		time: t.subtract(n, 'day').dayStart().value(),
		end: t.add(n, 'day').dayEnd().value(),
	}))(todayTime)
