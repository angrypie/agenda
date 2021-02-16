import { types, Instance } from 'mobx-state-tree'
import { Schedule } from './schedule'
import { Clock } from './clock'
import dayjs from 'dayjs'
import { createEnv } from './utils'
import { persist } from './persist'
import { SleepSpotPlan } from 'lib/spots/spot'

export const RootModel = types.model({
	schedule: Schedule,
	clock: types.optional(Clock, {
		now: dayjs().valueOf(),
		today: t(0),
	}),
})

function t(hours: number): number {
	return dayjs().startOf('day').add(hours, 'hour').valueOf()
}

export const stubPlans = {
	'11': { id: '11', name: 'Workout' },
	'12': { id: '12', name: 'Work' },
	'13': { id: '13', name: 'Clean home' },
	'14': { id: '14', name: 'Practice' },
	'16': { id: '16', name: 'Reed book' },
	'17': { id: '17', name: 'Take a walk' },
	'18': { id: '18', name: 'Ride bike' },
	'19': { id: '19', name: 'Watch series' },
	'20': { id: '20', name: 'Side project' },
	[SleepSpotPlan.id]: SleepSpotPlan,
}

export const rootStore = RootModel.create(
	{
		schedule: {
			plans: stubPlans,
		},
	},
	//Use typesafe getEnv from 'models/utils.ts'
	createEnv()
)

persist('rootStore', rootStore, {
	blacklist: ['clock'],
}).then(() => console.log('root store has been hydrated'))

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
