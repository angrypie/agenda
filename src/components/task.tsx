import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { observer } from 'mobx-react-lite'
import { isCurrentSpot } from 'lib/spots'
import { useStore } from 'models'
import { formatTime } from 'lib/time'

const subtasks = ['Some subtask', 'Another subtask']

export const Task = observer(({ task, hideSub = false }: TaskProps) => {
	const { name, time } = task
	const { clock } = useStore()
	const isCurrent = isCurrentSpot(clock.now, task)
	const displayTime = isCurrent ? clock.now : time

	const style = {
		opacity: isCurrent ? 1 : 0.5,
		height: hideSub ? 100 : 200,
	}

	return (
		<View style={[styles.task, style]}>
			<TaskHeader name={name} time={displayTime} />
			{hideSub ? null : <SubTasks tasks={subtasks} />}
		</View>
	)
})

const TaskHeader = ({ name, time }: { name: string; time: number }) => {
	return (
		<View style={styles.header}>
			<Header>{name}</Header>
			<TaskTime time={time} />
		</View>
	)
}

const SubTasks = ({ tasks }: { tasks: string[] }) => (
	<View style={styles.sub}>
		{tasks.map((task, i) => (
			<Text key={i}>{task}</Text>
		))}
	</View>
)

export const TaskTime = ({ time }: any) => <Header>{formatTime(time)}</Header>

interface TaskProps {
	hideSub?: boolean
	task: {
		id: string
		duration: number
		name: string
		time: number
	}
}
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
