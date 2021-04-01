import { Features, timeToFeatures } from './tags'
import { Arr, concat, head, last } from 'lib/collections'
import {
	FreeSpotPlan,
	NewSleepSpot,
	SleepSpotPlan,
	Spot,
	TimeSpan,
	timeSpanInclusion,
} from 'lib/spots/spot'
import { NewTime } from 'lib/time'
import { newSpots } from 'lib/spots'
import { v4 as uuidv4 } from 'uuid'
import { SpotsRepository } from 'lib/repository'

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

	//TODO suggest task based on history from storage
	const suggestTask = (timespan: TimeSpan): SpotSuggestion[] => {
		const t = NewTime(timespan.time).dayStart().add(23, 'hours')
		const sleepSpan = {
			time: t.value(),
			end: t.add(8, 'hours').value(),
		}
		//If sleep span not suite for selected spot
		if (!timeSpanInclusion(sleepSpan, timespan)) {
			return []
		}

		const spot = NewSleepSpot({ ...sleepSpan, id: uuidv4() })
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
					newSpots(concat(spots, injected)).slice(wholeTimeSpan)
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
