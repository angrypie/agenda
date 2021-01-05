import React from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { Spot } from 'lib/spots'
import { useStore, IPlan, FreeSpotPlan } from 'models'
import { timeSpanEnd } from 'lib/spots/spot'
import { TaskHeader } from './task'
import { AddTask } from './task-list'
import { ModalHeader } from './layout'
import { useLocalObservable, Observer } from 'mobx-react-lite'
import { ToggleHidden, Button } from './touchable'
import { Styles } from 'lib/style'
import DatePicker from 'react-native-date-picker'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()
	const task = schedule.tasks.get(spot.id)
	const spotEnd = timeSpanEnd(spot)

	const store = useLocalObservable(() => {
		const selected: [string, IPlan][] = []
		if (task !== undefined) {
			selected.push([task.plan.id, task.plan])
		}
		return {
			selected: new Map<string, IPlan>(selected),
			spotStart: spot.time,
			spotEnd,
			select(plan: IPlan) {
				const { id } = plan
				if (store.isSelected(id)) {
					store.selected.delete(id)
				} else {
					//TODO do not clean, display all selected
					store.selected.clear()
					store.selected.set(id, plan)
				}
			},

			isSelected(id: string): boolean {
				return store.selected.has(id)
			},

			get current(): IPlan {
				return Array.from(store.selected.values()).pop() || FreeSpotPlan
			},

			get spot(): Spot {
				const { spotStart, spotEnd } = store
				return { ...spot, time: spotStart, duration: spotEnd - spotStart }
			},

			get isChanged() {
				const current = Array.from(store.selected.values()).pop()
				const planChanged = current?.id !== task?.plan.id
				const timeChanged =
					spot.time !== store.spotStart || spotEnd !== store.spotEnd
				return planChanged || timeChanged
			},
		}
	})

	const renderPlans = ({ id, name }: IPlan) => (
		<Button key={id} onPress={() => store.select({ id, name })}>
			<View
				key={id}
				style={[
					{
						opacity: store.isSelected(id) ? 1 : 0.8,
						paddingVertical: 13,
					},
					Styles.rowBetween,
				]}
			>
				<Header>{name}</Header>
				{store.isSelected(id) ? <Text> [remove] </Text> : null}
			</View>
		</Button>
	)

	const doneButton = () => schedule.updateTask(store.spot, store.current)

	return (
		<Observer>
			{() => (
				<SafeView>
					<ModalHeader
						done={{
							disabled: !store.isChanged,
							onPress: doneButton,
							name: 'Save',
						}}
					/>

					<View style={{ opacity: 0.6 }}>
						<ToggleHidden
							visible={
								<TaskHeader name={store.current.name} time={store.spotStart} />
							}
							hidden={
								<DatePicker
									date={new Date(store.spotStart)}
									minimumDate={new Date(spot.time)}
									maximumDate={new Date(store.spotEnd)}
									onDateChange={time => (store.spotStart = time.valueOf())}
									textColor='white'
									minuteInterval={5}
									mode='datetime'
								/>
							}
						/>
						<SpotsSeparator />
						<ToggleHidden
							visible={<TaskHeader name='' time={store.spotEnd} />}
							hidden={
								<DatePicker
									date={new Date(store.spotEnd)}
									minimumDate={new Date(store.spotStart)}
									maximumDate={new Date(spotEnd)}
									onDateChange={time => (store.spotEnd = time.valueOf())}
									textColor='white'
									minuteInterval={5}
									mode='datetime'
								/>
							}
						/>
					</View>
					<Description />

					<ScrollView showsVerticalScrollIndicator={false}>
						<View>{Array.from(schedule.plans.values()).map(renderPlans)}</View>
					</ScrollView>
				</SafeView>
			)}
		</Observer>
	)
}

const SpotsSeparator = () => <View style={styles.spotsSeparator} />

const Description = () => (
	<View style={[styles.description, Styles.rowBetween]}>
		<Text style={{ opacity: 0.6, fontSize: 15 }}>
			Assign existing or add new task
		</Text>
		<AddTask />
	</View>
)

const styles = StyleSheet.create({
	spotsSeparator: {
		height: 35,
	},
	description: {
		height: 30,
		marginTop: 25,
		marginBottom: 10,
	},
})
