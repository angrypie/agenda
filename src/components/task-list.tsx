import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { useStore, ITask } from 'models'
import { observer } from 'mobx-react-lite'
import dayjs from 'dayjs'

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
			<Text style={{ opacity: 0.6, fontSize: 14 }}>{dateStr}</Text>
			<Text style={{ fontSize: 25, fontWeight: '600', marginTop: -10 }}>+</Text>
		</View>
	)
}

export const AddTask = () => {
	return (
		<View style={{ alignItems: 'center' }}>
			<Text style={{ fontSize: 30 }}>+</Text>
		</View>
	)
}

export const TaskList = () => {
	const { schedule } = useStore()

	return (
		<View>
			<ScrollView>
				<DayStatus />
				{schedule.tasks.map(task => (
					<Task key={task.id} task={task} />
				))}
				<AddTask />
			</ScrollView>
		</View>
	)
}

export const Task = observer(({ task }: { task: ITask }) => {
	const { name, time } = task
	const active = task.active()
	const { schedule } = useStore()

	const displayTime = active ? schedule.clock.now : time
	const style = { opacity: active ? 1 : 0.5 }
	return (
		<View style={[styles.task, style]}>
			<View style={styles.header}>
				<Header>{name}</Header>
				<TaskTime time={displayTime} />
			</View>
			<View style={styles.sub}>
				<Text>Some subtask</Text>
				<Text>Another subtask</Text>
			</View>
		</View>
	)
})

export const TaskTime = ({ time }: any) => (
	<Header>{dayjs(time).format('HH:mm')}</Header>
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
	},
	sub: {
		height: 40,
		justifyContent: 'space-around',
	},
})
