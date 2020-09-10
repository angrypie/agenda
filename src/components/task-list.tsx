import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from 'components/text'
import { useStore } from 'models'
import { observer } from 'mobx-react-lite'
import { formatDate, shiftDay, isToday } from 'lib/time'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeView } from 'components/safe-area'
import { Task } from 'components/task'
import { isActiveSpot, Spot } from 'lib/spots'
import { Swiper } from './swiper'

interface DayProps {
	//unix time start of the day
	day: number
}

export const TaskListScreen = () => <DaysSwiper />

export const DaysSwiper = () => {
	const { clock } = useStore()
	return (
		<Swiper
			renderItem={index => (
				<SafeView>
					<TaskList day={shiftDay(clock.today, index)} />
				</SafeView>
			)}
		/>
	)
}

export const TaskList = observer(({ day }: DayProps) => {
	const { schedule, clock } = useStore()
	const dayTasks = schedule.getDayTask(day)

	const renderTasks = (tasks: Spot[]) =>
		tasks.map(task => <Task key={task.id} task={task} />)

	const tasks = isToday(day)
		? dayTasks.filter(task => isActiveSpot(clock.now, task))
		: dayTasks

	return (
		<View style={{ flex: 1 }}>
			<DayStatus day={day} />
			<ScrollView>
				{renderTasks(tasks)}
				<AddTask />
			</ScrollView>
		</View>
	)
})

const DayStatus = ({ day }: DayProps) => {
	const dateStr = formatDate(day)

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 50,
			}}
		>
			<Text style={{ opacity: 0.6, fontSize: 14 }}>{dateStr}</Text>
		</View>
	)
}

export const AddTask = () => {
	const navigation = useNavigation()
	const onPress = () => navigation.navigate('AddTaskModal')

	return (
		<View style={{ alignItems: 'center' }}>
			<TouchableOpacity onPress={onPress}>
				<Text style={{ fontSize: 30 }}>+</Text>
			</TouchableOpacity>
		</View>
	)
}
