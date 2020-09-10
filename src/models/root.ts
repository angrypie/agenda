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

export const stubTasks = [
	{ id: '0', duration: d(8), name: 'Sleep', time: t(0) },
	{ id: '1', duration: d(1), name: 'Workout', time: t(9) },
	{ id: '2', duration: d(4), name: 'Work Session', time: t(10) },
	{ id: '3', duration: d(1), name: 'Clean Home', time: t(14) },
	{ id: '5', duration: d(4), name: 'Work Session', time: t(16) },
	{ id: '6', duration: d(3), name: 'Practice', time: t(20) },
	{ id: '7', duration: d(8), name: 'Sleep', time: t(24) },
]

export const rootStore = RootModel.create(
	{
		clock: { now: t(1), today: t(1) },
		schedule: {
			tasks: stubTasks,
		},
	},
	//Use typesafe getEnv from 'models/utils.ts'
	createEnv()
)

export const scheduler = CreateScheduler(rootStore)

export function CreateScheduler(root: Instance<typeof rootStore>) {
	const env = createEnv()

	const timer = setInterval(() => {
		const now = env.getUnixTimeMs()
		root.clock.update(now)
	}, 1000)
	return {
		stop() {
			clearInterval(timer)
		},
	}
}
