import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, Text } from 'components/text'
import { observer } from 'mobx-react-lite'
import { isActiveSpot, isCurrentSpot, Spot } from 'lib/spots'
import { useStore } from 'models'
import { formatTime } from 'lib/time'
import { useNavigation } from '@react-navigation/native'
import { Button } from './touchable'
import { Blinking } from './layout'

export const Task = observer(({ task }: TaskProps) => {
	const navigation = useNavigation()
	const { clock, schedule } = useStore()
	const { name, time } = task

	const isCurrent = isCurrentSpot(clock.now, task)
	const displayTime = isCurrent ? clock.now : time
	const style = { opacity: isCurrent ? 1 : 0.5 }

	const showFreeSpot =
		!schedule.tasks.has(task.id) && isActiveSpot(clock.now, task)

	return (
		<Button
			delayPressIn={300}
			onPress={() => navigation.navigate('SpotManager', { spot: task })}
		>
			<View style={[styles.task, style]}>
				{showFreeSpot ? (
					<FreeSpotHeader name={name} time={displayTime} />
				) : (
					<TaskHeader name={name} time={displayTime} />
				)}
			</View>
		</Button>
	)
})

interface TaskHeaderProps {
	name: string
	time: number
}

export const TaskHeader = ({ name, time }: TaskHeaderProps) => (
	<View style={styles.header}>
		<Header>{name}</Header>
		<TaskTime time={time} />
	</View>
)

export const FreeSpotHeader = ({ name, time }: TaskHeaderProps) => (
	<View>
		<View style={[styles.header, { marginTop: 10 }]}>
			<Header>{name}</Header>
			<TaskTime time={time} />
		</View>
		<Blinking style={{ marginTop: 10 }}>
			<Text>Tap to schedule task</Text>
		</Blinking>
	</View>
)

export const TaskTime = ({ time }: any) => <Header>{formatTime(time)}</Header>

interface TaskProps {
	task: Spot
}
const styles = StyleSheet.create({
	task: {
		flexDirection: 'column',
		justifyContent: 'center',
		height: 110,
		opacity: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
})
