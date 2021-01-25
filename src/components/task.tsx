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
	const isActive = isActiveSpot(clock.now, task)
	const displayTime = isCurrent ? clock.now : time
	const style = { opacity: isCurrent ? 1 : 0.5 }

	const showFreeSpot = !schedule.tasks.has(task.id) && isActive

	return (
		<Button
			delayPressIn={300}
			onPress={() => navigation.navigate('SpotManager', { spot: task })}
		>
			<View style={[styles.task, style]}>
				<TaskHeader
					name={name}
					time={displayTime}
					isFreeSpot={showFreeSpot}
					isActive={isActive}
				/>
			</View>
		</Button>
	)
})

interface TaskHeaderProps {
	name: string
	time: number
	isActive?: boolean
	isFreeSpot?: boolean
}

export const TaskHeader = ({
	name,
	time,
	isActive = true,
	isFreeSpot = false,
}: TaskHeaderProps) => (
	<View>
		<View style={[styles.header, { marginTop: isFreeSpot ? 10 : 0 }]}>
			<Header
				style={{ textDecorationLine: isActive ? 'none' : 'line-through' }}
			>{`${name}\xa0\xa0`}</Header>
			<TaskTime time={time} />
		</View>
		{isFreeSpot ? (
			<Blinking style={{ marginTop: 10 }}>
				<Text>Tap to schedule task</Text>
			</Blinking>
		) : null}
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
		height: 100,
		opacity: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
})
