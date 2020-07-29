import { types, onSnapshot } from 'mobx-state-tree'
import { Schedule } from './schedule'

export const RootModel = types.model({
	schedule: Schedule,
})

export const rootStore = RootModel.create({
	schedule: {
		tasks: [
			{ id: '1', name: 'Programming', time: '8:00' },
			{ id: '2', name: 'Workout', time: '12:30' },
			{ id: '3', name: 'Clean Home', time: '14:00' },
			{ id: '4', name: 'Pay Bills', time: '15:00' },
			{ id: '5', name: 'Workout', time: '16:00' },
			{ id: '6', name: 'Work Session', time: '17:00' },
		],
	},
})

onSnapshot(rootStore, snapshot => console.log('Snapshot: ', snapshot))
