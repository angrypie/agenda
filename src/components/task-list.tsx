import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from 'components/text'
import { useStore } from 'models'
import { observer, useLocalStore } from 'mobx-react-lite'
import { formatDate, shiftDay, isToday } from 'lib/time'
import Swiper from 'react-native-swiper'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeView } from 'components/safe-area'
import { Task } from 'components/task'
import { isActiveSpot, Spot } from 'lib/spots'

interface DayProps {
	//unix time start of the day
	day: number
}

export const TaskListScreen = () => <DaysSwiper />

export const initSwiperDays = (now: number, size: number) =>
	[...Array(size).keys()].map((_, i) => shiftDay(now, i === size - 1 ? -1 : i))

export const DaysSwiper = () => {
	const { clock } = useStore()
	const { now } = clock
	const size = 3
	const store = useLocalStore(() => ({
		days: initSwiperDays(now, size),
		current: 0,
		setCurrent(index: number) {
			const { current, days } = store
			const d = current - index
			const forward = d === -1 || d > 1
			const i = days.findIndex((_, i) => i !== current && i !== index)
			if (i !== undefined) {
				days[i] = shiftDay(days[i], forward ? 3 : -3)
			}
			store.current = index
		},
	}))

	const shiftDays = (index: number) => {
		store.setCurrent(index)
	}

	return (
		<Swiper showsPagination={false} onIndexChanged={shiftDays}>
			{store.days.map((_, i) => (
				<SafeView key={i}>
					<TaskListPage store={store} index={i} />
				</SafeView>
			))}
		</Swiper>
	)
}

//TaskListPage needs to watch local store in DaySwiper for changes
export const TaskListPage = observer(({ store, index }: any) => {
	const day = store.days[index]
	return <TaskList day={day} />
})

export const TaskList = observer(({ day }: DayProps) => {
	const { schedule, clock } = useStore()
	const dayTasks = schedule.getDayTask(day)

	const renderTasks = (tasks: Spot[]) =>
		tasks.map(task => <Task key={task.id} task={task} />)

	const tasks = isToday(day)
		? dayTasks.filter(task => isActiveSpot(clock.now, task))
		: dayTasks

	return (
		<View>
			<ScrollView>
				<DayStatus day={day} />
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
