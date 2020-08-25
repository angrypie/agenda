import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Header } from 'components/text'
import { useStore, ITask } from 'models'
import { observer, useLocalStore } from 'mobx-react-lite'
import { formatDate, formatTime, shiftDay } from 'lib/time'
import Swiper from 'react-native-swiper'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'

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
				<TaskListPage key={i} store={store} index={i} />
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
	const { schedule } = useStore()
	const dayTasks = schedule.getDayTaks(day)

	return (
		<View>
			<ScrollView>
				<DayStatus day={day} />
				{dayTasks.map(task => (
					<Task key={task.id} task={task} />
				))}
				<AddTask />
			</ScrollView>
		</View>
	)
})

export const Task = observer(
	({ task, hideSub = false }: { task: ITask; hideSub?: boolean }) => {
		const { name, time, active } = task
		const { clock } = useStore()

		const displayTime = active ? clock.now : time
		const style = {
			opacity: active ? 1 : 0.5,
			height: hideSub ? 100 : 200,
		}
		return (
			<View style={[styles.task, style]}>
				<View style={styles.header}>
					<Header>{name}</Header>
					<TaskTime time={displayTime} />
				</View>
				{hideSub ? null : (
					<View style={styles.sub}>
						<Text>Some subtask</Text>
						<Text>Another subtask</Text>
					</View>
				)}
			</View>
		)
	}
)

export const TaskTime = ({ time }: any) => <Header>{formatTime(time)}</Header>

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
	const onPress = () => navigation.navigate('MyModal')

	return (
		<View style={{ alignItems: 'center' }}>
			<TouchableOpacity onPress={onPress}>
				<Text style={{ fontSize: 30 }}>+</Text>
			</TouchableOpacity>
		</View>
	)
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
