import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from 'components/text'
import { useStore } from 'models'
import { observer } from 'mobx-react-lite'
import { formatDate, shiftDay } from 'lib/time'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeView } from 'components/safe-area'
import { SleepTask, Task } from 'components/task'
import { Spot } from 'lib/spots'
import { Swiper } from './swiper'
import { SleepSpotPlan } from 'lib/spots/spot'

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
	const { schedule } = useStore()
	//const allTasks = schedule.tasks
	const dayTasks = schedule.getDayTasks(day)

	const renderTasks = (tasks: Spot[]) =>
		tasks.map((task, index) =>
			task.plan === SleepSpotPlan.id ? (
				<SleepTask
					key={task.id}
					type={index === 0 ? 'wakeup' : 'bedtime'}
					task={task}
				/>
			) : (
				<Task key={task.id} task={task} />
			)
		)

	//If day is today then hide past tasks
	//const tasks = isToday(day)
	//? dayTasks.filter(task => isActiveSpot(clock.now, task))
	//: dayTasks
	const tasks = dayTasks

	return (
		<View style={{ flex: 1 }}>
			<DayHeader day={day} />
			<ScrollView showsVerticalScrollIndicator={false}>
				{renderTasks(tasks)}
			</ScrollView>
		</View>
	)
})

const DayHeader = ({ day }: DayProps) => {
	const dateStr = formatDate(day)

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 60,
			}}
		>
			<Text style={{ opacity: 0.6, fontSize: 14 }}>{dateStr}</Text>
			<AddTask />
		</View>
	)
}

export const AddTask = () => {
	const navigation = useNavigation()
	const onPress = () => navigation.navigate('AddTaskModal')

	return (
		<TouchableOpacity onPress={onPress}>
			<Text
				style={{
					fontSize: 16,
					paddingLeft: 10,
				}}
			>
				Tasks
			</Text>
		</TouchableOpacity>
	)
}
