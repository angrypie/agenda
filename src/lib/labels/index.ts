import { Features, timeToFeatures } from './tags'

export interface Task {
	id: string
	time: number
	duration: number
}

export function newMatcher() {
	const log = new Map<string, Task>()

	const trainModel = () => {
		//TODO train set using tasks log
	}
	const matchByFeatures = (features: Features): Task[] => {
		//TODO use trained NN here
		return [...log.values()].slice(Math.max(log.size - 3), 1)
	}

	return {
		//log adds tasks to train set
		log(tasks: Task[]) {
			tasks.forEach(task => log.set(task.id, task))
			trainModel()
		},

		match(time: number): Task[] {
			const features = timeToFeatures(time)
			return matchByFeatures(features)
		},
	}
}
