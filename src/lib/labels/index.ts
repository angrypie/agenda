export interface Task {
	id: string
	tags: string[]
	time: number
	duration: number
}

export function newMatcher() {
	const log = new Map<string, Task>()

	const trainModel = () => {
		//TODO train set using tasks log
	}

	return {
		//log adds tasks to train set
		log(tasks: Task[]) {
			tasks.forEach(task => log.set(task.id, task))
			trainModel()
		},

		match(time: number): string[] {},
	}
}
