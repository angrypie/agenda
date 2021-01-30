import { Features, timeToFeatures } from './tags'

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
