import { types, Instance } from 'mobx-state-tree'
import { Schedule } from './schedule'
import { Clock } from './clock'
import dayjs from 'dayjs'
import { createEnv } from './utils'

export const RootModel = types.model({
	schedule: Schedule,
	clock: Clock,
})

function t(hours: number): number {
	return dayjs().startOf('day').add(hours, 'hour').valueOf()
}

function d(hours: number): number {
	return hours * 3600000
}

export const rootStore = RootModel.create(
	{
		clock: {},
		schedule: {
			tasks: [
				{ id: '0', duration: d(7), name: 'Sleep', time: t(0) },
				{ id: '2', duration: d(4), name: 'Work Session', time: t(10) },
				{ id: '1', duration: d(2), name: 'Workout', time: t(8) },
				{ id: '3', duration: d(1), name: 'Clean Home', time: t(14) },
				{ id: '4', duration: d(1), name: 'Pay Bills', time: t(15) },
				{ id: '6', duration: d(3), name: 'Practice', time: t(19) },
				{ id: '5', duration: d(3), name: 'Work Session', time: t(16) },
				{ id: '9', duration: d(1), name: 'Free Time', time: t(22) },
				{ id: '7', duration: d(9), name: 'Sleep', time: t(23) },
			],
		},
	},
	//Use typesafe getEnv from 'models/utils.ts'
	createEnv()
)

export const scheduler = CreateScheduler(rootStore)

export function CreateScheduler(root: Instance<typeof rootStore>) {
	const env = createEnv()

	const timer: number = setInterval(() => {
		const now = env.getUnixTimeMs()
		root.schedule.update(now)
		root.clock.update(now)
	}, 1000)
	return {
		stop() {
			clearInterval(timer)
		},
	}
}
