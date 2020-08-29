import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { Task, TaskTime } from 'components/task-list'
import { useStore } from 'models'
import { observer } from 'mobx-react-lite'
import { SafeView } from 'components/safe-area'

export const DayFocusScreen = () => (
	<SafeView>
		<DayFocus />
	</SafeView>
)

export const DayFocus = observer(() => {
	const { schedule, clock } = useStore()

	const task = schedule.currentTask

	const nextTask = schedule.getNextTask(clock.now)
	return (
		<View style={styles.dayFocus}>
			<View style={[styles.right, { opacity: 0.2 }]}>
				<View />
				{task ? <TaskTime time={task.time} /> : null}
			</View>
			<View style={{ top: -40 }}>
				{task ? (
					<Task task={task} />
				) : (
					<View>
						<Header>Fee Time</Header>
						<Text> Tap to pick a task for now</Text>
					</View>
				)}
			</View>
			<View style={{ opacity: 0.4 }}>
				{nextTask ? (
					<Task task={nextTask} hideSub />
				) : (
					<Header>Fee Time</Header>
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
