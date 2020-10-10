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
	{ id: '0', plan: '15', duration: d(8), name: 'Sleep', time: t(0) },
	{ id: '1', plan: '11', duration: d(1), name: 'Workout', time: t(9) },
	{ id: '2', plan: '12', duration: d(4), name: 'Work Session', time: t(10) },
	{ id: '3', plan: '13', duration: d(1), name: 'Clean Home', time: t(14) },
	{ id: '5', plan: '12', duration: d(4), name: 'Work Session', time: t(16) },
	{ id: '6', plan: '14', duration: d(2), name: 'Practice', time: t(20) },
	{ id: '7', plan: '15', duration: d(8), name: 'Sleep', time: t(24) },
]

export const stubPlans = [
	{ id: '11', name: 'Workout' },
	{ id: '12', name: 'Work Session' },
	{ id: '13', name: 'Clean home' },
	{ id: '14', name: 'Practice' },
	{ id: '15', name: 'Sleep' },
	{ id: '16', name: 'Reed book' },
	{ id: '17', name: 'Take a walk' },
	{ id: '18', name: 'Ride bike' },
	{ id: '19', name: 'Watch series' },
	{ id: '20', name: 'Side project' },
]

export const rootStore = RootModel.create(
	{
		clock: { now: t(1), today: t(1) },
		schedule: {
			tasks: stubTasks,
			plans: stubPlans,
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
