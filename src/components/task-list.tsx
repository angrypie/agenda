import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { useStore, ITask } from 'models'
import { observer } from 'mobx-react-lite'
import { formatDate, formatTime, Day, getDayStart } from 'lib/time'
import Swiper from 'react-native-swiper'

interface DayProps {
	day: Day
}

const DayStatus = ({ day }: DayProps) => {
	const dateStr = formatDate(getDayStart(day))

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

export const TaskListScreen = () => {
	const days = [
		{ day: 7, month: 7, year: 2020 },
		{ day: 8, month: 7, year: 2020 },
		{ day: 9, month: 7, year: 2020 },
	]

	return (
		<Swiper>
			{days.map((day, key) => (
				<TaskList key={key} day={day} />
			))}
		</Swiper>
	)
}

export const TaskList = ({ day }: DayProps) => {
	const { schedule } = useStore()
	const dayTasks = schedule.getDayTaks(day)

	return (
		<View>
			<ScrollView>
				<DayStatus day={day} />
				{dayTasks.map(task => (
					<Task key={task.id} task={task} />
				))}
				<AddTask />
			</ScrollView>
		</View>
	)
}

export const Task = observer(
	({ task, hideSub = false }: { task: ITask; hideSub?: boolean }) => {
		const { name, time, active } = task
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
