import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'components/text'
import { Task } from 'components/task-list'
import { useStore } from 'models'

//TODO pass data to Task component
export const DayFocus = () => {
	const { schedule } = useStore()

	const tasks = schedule.currentTasks

	if (tasks.length === 0) {
		return (
			<View>
				<Text>There is no tasks today</Text>
			</View>
		)
	}

	const task = tasks[0]
	return (
		<View style={styles.dayFocus}>
			<View>
				<Text>12:30</Text>
			</View>
			<View>
				<Task task={task} />
			</View>

			<View>
				<Text>18:30</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	dayFocus: {
		flex: 1,
	},
})
