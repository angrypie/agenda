import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { observer } from 'mobx-react-lite'
import { isCurrentSpot, Spot } from 'lib/spots'
import { useStore } from 'models'
import { formatTime } from 'lib/time'

const subtasks = ['Some subtask', 'Another subtask']

export const TaskFullHeight = 200

export const Task = observer(({ task, hideSub = false }: TaskProps) => {
	const { name, time } = task
	const { clock } = useStore()
	const isCurrent = isCurrentSpot(clock.now, task)
	const displayTime = isCurrent ? clock.now : time

	const style = {
		opacity: isCurrent ? 1 : 0.5,
		height: hideSub ? 100 : TaskFullHeight,
	}

	const isFree = isFreeSpot(task)

	return (
		<View style={[styles.task, style]}>
			<TaskHeader name={name} time={displayTime} />
			{hideSub ? null : isFree ? (
				<FreeSpotSuggestion spot={task} />
			) : (
				<SubTasks tasks={subtasks} />
			)}
		</View>
	)
})

const FreeSpotSuggestion = ({ spot }: { spot: Spot }) => {
	return (
		<View style={styles.spotSuggestion}>
			<Text>Tap to schedule task</Text>
		</View>
	)
}

//TODO use category tag to figure out is it base free spot
const isFreeSpot = (spot: Spot): boolean => {
	return spot.name === 'Free spot'
}

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
	task: Spot
}
const styles = StyleSheet.create({
	task: {
		flexDirection: 'column',
		justifyContent: 'center',
		opacity: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sub: {
		height: 40,
		marginTop: 40,
		justifyContent: 'space-around',
	},
	spotSuggestion: {
		justifyContent: 'center',
		alignItems: 'center',
		//opacity: 0.6,
		borderWidth: 2,
		borderRadius: 5,
		borderStyle: 'dashed',
		//marginVertical: 30,
		height: 50,
		marginTop: 30,
		marginHorizontal: 5,
		borderColor: 'white',
	},
})
