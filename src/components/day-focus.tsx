import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { Task, TaskTime } from 'components/task-list'
import { useStore } from 'models'
import { observer } from 'mobx-react-lite'

export const DayFocus = observer(() => {
	const { schedule } = useStore()

	const task = schedule.currentTask

	if (task === undefined) {
		return (
			<View>
				<Text>There is no tasks today</Text>
			</View>
		)
	}

	const nextTask = schedule.getNextTask(task)
	return (
		<View style={styles.dayFocus}>
			<View style={[styles.right, { opacity: 0.2 }]}>
				<View />
				<TaskTime time={task.time} />
			</View>
			<View style={{ top: -40 }}>
				<Task task={task} />
			</View>
			<View style={{ opacity: 0.4 }}>
				{!nextTask ? (
					<Header>Fee Time</Header>
				) : (
					<Task task={nextTask} hideSub />
				)}
			</View>
		</View>
	)
})

//some color
const styles = StyleSheet.create({
	dayFocus: {
		flex: 1,
		justifyContent: 'space-between',
	},
	right: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
})
