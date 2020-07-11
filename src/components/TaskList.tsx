import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text } from 'components/text'

interface TaskData {
	id: string
	name: string
	time: string
	active: boolean
}

const tasks = [
	{ id: '1', name: 'Programming', time: '8:00', active: false },
	{ id: '2', name: 'Workout', time: '12:30', active: true },
	{ id: '3', name: 'Clean Home', time: '14:00', active: false },
	{ id: '4', name: 'Pay Bills', time: '15:00', active: false },
	{ id: '5', name: 'Clean Home', time: '14:00', active: false },
	{ id: '6', name: 'Clean Home', time: '14:00', active: false },
]

const DayStatus = () => {
	const dateStr = 'Monday, Jul 24'

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Text style={{ opacity: 0.6, fontWeight: '500' }}>{dateStr}</Text>
			<Text style={{ fontSize: 25, fontWeight: '600', marginTop: -10 }}>+</Text>
		</View>
	)
}

export const AddTask = () => {
	return (
		<View style={{ alignItems: 'center' }}>
			<Text style={{ fontSize: 30, fontWeight: '500' }}>+</Text>
		</View>
	)
}

export const TaskList = () => {
	const renderTask = ({ item }: { item: TaskData }) => (
		<Task key={item.id} {...item} />
	)
	return (
		<View>
			<ScrollView>
				<DayStatus />
				{tasks.map(item => renderTask({ item }))}
				<AddTask />
			</ScrollView>
		</View>
	)
}

export const Task = ({ name, time, active }: any) => {
	const style = { opacity: active ? 1 : 0.5 }
	return (
		<View style={[styles.task, style]}>
			<View style={styles.header}>
				<Header>{name}</Header>
				<Header>{time}</Header>
			</View>
			<View style={styles.sub}>
				<Text>Some subtask</Text>
				<Text>Another subtask</Text>
			</View>
		</View>
	)
}

const Header = ({ children }: any) => (
	<Text style={{ fontWeight: 'bold', fontSize: 30 }}>{children}</Text>
)

const styles = StyleSheet.create({
	task: {
		height: 200,
		flexDirection: 'column',
		justifyContent: 'center',
		opacity: 1,
	},
	header: {
		height: 120,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: 340,
	},
	sub: {
		height: 40,
		justifyContent: 'space-around',
	},
})
