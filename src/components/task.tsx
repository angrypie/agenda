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

export const TaskFullHeight = 110

//TODO make free spot more different from regular task
export const Task = observer(({ task }: TaskProps) => {
	const { name, time } = task
	const { clock } = useStore()
	const isCurrent = isCurrentSpot(clock.now, task)
	const displayTime = isCurrent ? clock.now : time

	const style = {
		opacity: isCurrent ? 1 : 0.5,
		height: TaskFullHeight,
	}

	const isFree = isFreeSpot(task)

	const navigation = useNavigation()
	return (
		<Button
			delayPressIn={300}
			onPress={() => navigation.navigate('SpotManager', { spot: task })}
		>
			<View style={[styles.task, style]}>
				{isFree && isActiveSpot(clock.now, task) ? (
					<FreeSpotHeader name={name} time={displayTime} />
				) : (
					<TaskHeader name={name} time={displayTime} />
				)}
			</View>
		</Button>
	)
})

//TODO use category tag to figure out is it base free spot
const isFreeSpot = (spot: Spot): boolean => {
	return spot.name === 'Free spot'
}

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
		opacity: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
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
