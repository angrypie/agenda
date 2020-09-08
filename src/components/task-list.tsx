import React, { useRef } from 'react'
import { View, ScrollView, FlatList, Dimensions } from 'react-native'
import { Text } from 'components/text'
import { useStore } from 'models'
import { observer, useLocalStore } from 'mobx-react-lite'
import { formatDate, shiftDay, isToday } from 'lib/time'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeView } from 'components/safe-area'
import { Task } from 'components/task'
import { isActiveSpot, Spot } from 'lib/spots'

interface DayProps {
	//unix time start of the day
	day: number
}

const { width } = Dimensions.get('window')

export const TaskListScreen = () => <DaysSwiper />

export const initSwiperDays = (now: number, size: number) => {
	const half = Math.floor(size / 2)
	const diffs = [...Array(size).keys()].map((_, i) =>
		i < half ? -(half - i) : i - half
	)
	return diffs.map(diff => shiftDay(now, diff))
}

//TODO onIndexChanged do not allow to make two fast swipes,
//its fires only once in such situation.
export const DaysSwiper = () => {
	const { clock } = useStore()
	const { now } = clock
	//TODO decide how many screens needed and solve problem with
	//multiple swipes lag when sreens buffer size is not enough
	const size = 7
	const half = Math.floor(size / 2)
	const ref = useRef(null)
	const store = useLocalStore(() => ({
		days: initSwiperDays(now, size),
		current: half,
		setCurrent(index: number) {
			const { current, days } = store
			if (current === index) {
				return
			}
			const d = current - index
			//const forward = d === -1 || d > 1
			store.days.forEach((day, i) => (days[i] = shiftDay(day, -d)))
			ref.current.scrollToIndex({ index: half, animated: false })
		},
	}))

	const shiftDays = (index: number) => {
		store.setCurrent(index)
	}

	const onChanged = useRef(({ viewableItems }: any) => {
		if (viewableItems.length !== 1) {
			return
		}
		shiftDays(viewableItems[0].index)
	})
	return (
		<FlatList
			ref={ref}
			onViewableItemsChanged={onChanged.current}
			data={store.days}
			keyExtractor={item => item.toString()}
			renderItem={({ item, index }) => (
				<View style={{ width }}>
					<SafeView>
						<TaskListPage store={store} index={index} />
					</SafeView>
				</View>
			)}
			onScrollToIndexFailed={info => {
				//TODO what to do with such situation?
				console.log('failed', info.index)
			}}
			initialScrollIndex={half}
			getItemLayout={(data, index) => ({
				length: width,
				offset: width * index,
				index,
			})}
			pagingEnabled
			horizontal
		/>
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
		<View style={{ flex: 1 }}>
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
			<Text style={{ opacity: 0.6, fontSize: 14, marginTop: 30 }}>
				{dateStr}
			</Text>
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
