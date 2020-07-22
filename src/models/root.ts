import { types, onSnapshot } from 'mobx-state-tree'
import { Schedule } from './schedule'

export const RootModel = types.model({
	schedule: Schedule,
})

export const rootStore = RootModel.create({
	schedule: {
		tasks: [
			{ id: '1', name: 'Programming', time: '8:00', active: false },
			{ id: '2', name: 'Workout', time: '12:30', active: true },
			{ id: '3', name: 'Clean Home', time: '14:00', active: false },
			{ id: '4', name: 'Pay Bills', time: '15:00', active: false },
			{ id: '5', name: 'Clean Home', time: '14:00', active: false },
			{ id: '6', name: 'Clean Home', time: '14:00', active: false },
		],
	},
})

onSnapshot(rootStore, snapshot => console.log('Snapshot: ', snapshot))
