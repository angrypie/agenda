import { Features, timeToFeatures } from './tags'
import { Arr, head, last } from 'lib/collections'
import {
	FreeSpotPlan,
	NewSleepSpot,
	Spot,
	TimeSpan,
	timeSpanInclusion,
} from 'lib/spots/spot'
import { NewTime } from 'lib/time'
import { newSpots } from 'lib/spots'
import { v4 as uuidv4 } from 'uuid'

export interface Task {
	id: string
	time: number
	end: number
}

export function newMatcher<T extends Task>() {
	const log = new Map<string, T>()

	const trainModel = () => {
		//TODO train set using tasks log
	}
	const matchByFeatures = (features: Features): T[] => {
		//TODO use trained NN here
		return [...log.values()].slice(Math.max(log.size - 3, 1))
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
	}
}

export const createSuggestedTasks = (spots: Arr<Spot>): Spot[] => {
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
