import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Task, TaskTime } from 'components/task'
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

	const spot = schedule.getCurrentSpot(clock.now)
	const nextTask = schedule.getNextTask(clock.now)
	return (
		<View style={styles.dayFocus}>
			<View style={[styles.right, { opacity: 0.2 }]}>
				<View />
				<TaskTime time={spot.time} />
			</View>
			<View style={{ top: -40 }}>
				<Task task={spot} />
			</View>
			<View style={{ opacity: 0.4 }}>
				<Task task={nextTask} hideSub />
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
