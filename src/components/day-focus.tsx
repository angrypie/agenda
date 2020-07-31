import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'components/text'
import { Task, TaskTime } from 'components/task-list'
import { useStore } from 'models'

export const DayFocus = () => {
	const { schedule } = useStore()

	const tasks = schedule.current

	if (tasks.length === 0) {
		return (
			<View>
				<Text>There is no tasks today</Text>
			</View>
		)
	}

	const task = tasks[0]
	const nextTask = schedule.getNextTask(task)
	return (
		<View style={styles.dayFocus}>
			<View style={[styles.right, styles.dim]}>
				<View />
				<TaskTime time={task.time} />
			</View>
			<View>
				<Task task={task} />
			</View>
			{!nextTask ? null : <Task task={nextTask} hideSub />}
		</View>
	)
}

//some color
const styles = StyleSheet.create({
	dayFocus: {
		flex: 1,
		justifyContent: 'space-between',
	},
	dim: {
		opacity: 0.5,
	},
	right: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
})
