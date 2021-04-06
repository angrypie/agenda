import { Features, timeToFeatures } from './tags'
import { Arr, head, last } from 'lib/collections'
import {
	FreeSpotPlan,
	NewSleepSpot,
	NewTimeSpanDuration,
	SleepSpotPlan,
	Spot,
	TimeSpan,
	timeSpanInclusion,
} from 'lib/spots/spot'
import { newSpots } from 'lib/spots'
import { v4 as uuidv4 } from 'uuid'
import { SpotsRepository } from 'lib/repository'
import { groupWith, map, pipe, sort } from 'rambda'
import { getDayStart, NewTime } from 'lib/time'

export interface Task {
	id: string
	time: number
	end: number
}

export interface SpotSuggestion {
	spot: Spot
	prob: number
}

export function newMatcher<T extends Task>(storage: SpotsRepository) {
	const log = new Map<string, T>()

	const trainModel = () => {
		//TODO train set using tasks log
	}

	const matchByFeatures = (features: Features): T[] => {
		//TODO use trained NN here
		return [...log.values()].slice(Math.max(log.size - 3, 1))
	}

	const suggestTask = (timespan: TimeSpan): SpotSuggestion[] => {
		const sleepHistory = storage.getByPlan(SleepSpotPlan.id)
		if (sleepHistory.length === 0) {
			//TODO do not hardcode default sleep and other defaults
			sleepHistory.push(getDefaultSleepSpot(timespan.time))
		}
		const suggestions = suggestTaskTimeSpan(timespan, sleepHistory)
		if (suggestions.length === 0) {
			return []
		}

		const spot = suggestions[0].spot
		return [{ spot, prob: 1 }]
	}

	const injectSuggestedTasks = (spots: Arr<Spot>): Arr<Spot> => {
		const wholeTimeSpan = {
			time: head(spots).time,
			end: last(spots).end,
		}
		const injected: Spot[] = []

		spots.forEach(s => {
			if (s.plan !== FreeSpotPlan.id) {
				return
			}
			const suggestions = suggestTask(s)
			//by now inject only sleep task as most obviously needed
			suggestions.forEach(
				({ spot }) => spot.plan === SleepSpotPlan.id && injected.push(spot)
			)
		})

		return injected.length === 0
			? spots
			: injectSuggestedTasks(
					newSpots(spots.concat(injected)).slice(wholeTimeSpan)
			  )
	}

	return {
		//log adds tasks to train set
		log(tasks: T[]) {
			tasks.forEach(task => log.set(task.id, task))
			trainModel()
		},

		match(time: number): T[] {
			const features = timeToFeatures(time)
			return matchByFeatures(features)
		},

		createSuggestedTasks: injectSuggestedTasks,
	}
}

const suggestTaskTimeSpan = (
	timespan: TimeSpan,
	history: Spot[]
): SpotSuggestion[] => {
	if (history.length === 0) {
		return []
	}

	const getHours = (a: Spot) => NewTime(a.time).get('hours').value()

	const groups = groupWith((a: Spot, b) => getHours(a) === getHours(b), history)
	const pairs = map(group => [group.length, group] as [number, Spot[]], groups)
	const sorted = sort((a, b) => b[0] - a[0], pairs)

	const spot = sorted[0][1][0]

	const fromDayStart = spot.time - getDayStart(spot.time)
	const spotDuration = spot.end - spot.time
	const dayStart = getDayStart(timespan.time)

	const newSpotTime = NewTimeSpanDuration(dayStart + fromDayStart, spotDuration)

	const newSpot = {
		...spot,
		...newSpotTime.get(),
		id: uuidv4(),
	}

	//TODO pick another time
	if (!timeSpanInclusion(newSpot, timespan)) {
		return []
	}

	const suggestion = {
		spot: newSpot,
		prob: 1,
	}

	return [suggestion]
}

const getDefaultSleepSpot = (time: number): Spot =>
	pipe(
		NewTime,
		t => t.dayStart().add(23, 'hours'),
		t =>
			NewSleepSpot({
				id: uuidv4(),
				time: t.value(),
				end: t.add(8, 'hours').value(),
			})
	)(time)
