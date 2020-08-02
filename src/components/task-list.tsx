import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { useStore, ITask } from 'models'
import { observer } from 'mobx-react-lite'
import { formatDate, formatTime } from 'lib/time'

const DayStatus = observer(() => {
	const { clock } = useStore()
	const dateStr = formatDate(clock.now)

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
})

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
				{schedule.todayTasks.map(task => (
					<Task key={task.id} task={task} />
				))}
				<AddTask />
			</ScrollView>
		</View>
	)
}

export const Task = observer(
	({ task, hideSub = false }: { task: ITask; hideSub?: boolean }) => {
		const { name, time } = task
		const active = task.active()
		const { clock } = useStore()

		const displayTime = active ? clock.now : time
		const style = {
			opacity: active ? 1 : 0.5,
			height: hideSub ? 100 : 200,
		}
		return (
			<View style={[styles.task, style]}>
				<View style={styles.header}>
					<Header>{name}</Header>
					<TaskTime time={displayTime} />
				</View>
				{hideSub ? null : (
					<View style={styles.sub}>
						<Text>Some subtask</Text>
						<Text>Another subtask</Text>
					</View>
				)}
			</View>
		)
	}
)

export const TaskTime = ({ time }: any) => <Header>{formatTime(time)}</Header>

const styles = StyleSheet.create({
	task: {
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
