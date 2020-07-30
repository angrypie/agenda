import { types, onSnapshot } from 'mobx-state-tree'
import { Schedule } from './schedule'
import dayjs from 'dayjs'

export const RootModel = types.model({
	schedule: Schedule,
})

function t(hours: number): number {
	return dayjs().startOf('day').add(hours, 'hour').unix()
}

function d(hours: number): number {
	return hours * 3600
}

export const rootStore = RootModel.create({
	schedule: {
		tasks: [
			{ id: '1', duration: d(2), name: 'Workout', time: t(8) },
			{ id: '2', duration: d(4), name: 'Work Session', time: t(10) },
			{ id: '3', duration: d(1), name: 'Clean Home', time: t(14) },
			{ id: '4', duration: d(1), name: 'Pay Bills', time: t(15) },
			{ id: '5', duration: d(4), name: 'Work Session', time: t(16) },
			{ id: '6', duration: d(3), name: 'Practice', time: t(20) },
			{ id: '7', duration: d(9), name: 'Sleep', time: t(23) },
		],
	},
})

onSnapshot(rootStore, snapshot => console.log('Snapshot: ', snapshot))
