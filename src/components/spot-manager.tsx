import React, { useState } from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { isCurrentSpot, Spot } from 'lib/spots'
import { useStore, IPlan, FreeSpotPlan } from 'models'
import { timeSpanEnd } from 'lib/spots/spot'
import { TaskHeader } from './task'
import { AddTask } from './task-list'
import { ModalHeader } from './layout'
import { useLocalObservable, Observer } from 'mobx-react-lite'
import { Button } from './touchable'
import { Styles } from 'lib/style'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()
	const store = useSpotManager(spot)

	const doneButton = () => schedule.updateTask(store.spot, store.current)

	const [layoutWidth, setLayoutWidth] = useState(300)

	const onSliderChange = ([start, end]: number[]) => {
		store.setSpotStart(start)
		store.setSpotEnd(end)
	}

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

					<View
						onLayout={event => setLayoutWidth(event.nativeEvent.layout.width)}
						style={{ opacity: 0.6 }}
					>
						<TaskHeader name={store.current.name} time={store.time} />
						<SpotsSeparator />
						<TaskHeader name='' time={store.spotEnd} />
						<View style={{ marginLeft: 10 }}>
							<MultiSlider
								values={[store.time, store.spotEnd]}
								sliderLength={layoutWidth - 20}
								onValuesChange={onSliderChange}
								min={store.timespan.start}
								max={store.timespan.end}
								step={300000}
								allowOverlap={false}
								snapped
								minMarkerOverlapDistance={40}
							/>
						</View>
					</View>
					<Description />

					<ScrollView showsVerticalScrollIndicator={false}>
						<View>
							{Array.from(schedule.plans.values()).map(plan =>
								PlanItem(plan, store)
							)}
						</View>
					</ScrollView>
				</SafeView>
			)}
		</Observer>
	)
}

type SpotManagerStore = ReturnType<typeof useSpotManager>

const useSpotManager = (spot: Spot) => {
	const { schedule, clock } = useStore()
	const task = schedule.tasks.get(spot.id)
	const spotStart = spot.time
	const spotEnd = timeSpanEnd(spot)

	const currentTime = clock.getCurrentTime()

	const store = useLocalObservable(() => {
		const selected: [string, IPlan][] = []
		if (task !== undefined) {
			selected.push([task.plan.id, task.plan])
		}
		return {
			selected: new Map<string, IPlan>(selected),
			//Initil spot time span
			timespan: { start: spotStart, end: spotEnd },
			//TODO: use NewTimeSpan
			time: isCurrentSpot(currentTime, spot) ? currentTime : spotStart, // Spot sstart time
			duration: isCurrentSpot(currentTime, spot)
				? spotEnd - currentTime
				: spot.duration, //Spot duration
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

			get spotEnd(): number {
				return timeSpanEnd(store)
			},

			//TODO disallow start end time overlap
			setSpotStart(startTime: number) {
				const currentEnd = store.spotEnd
				store.time = startTime
				store.duration = currentEnd - startTime
			},

			setSpotEnd(endTime: number) {
				store.duration = endTime - store.time
			},

			isSelected(id: string): boolean {
				return store.selected.has(id)
			},

			get current(): IPlan {
				return Array.from(store.selected.values()).pop() || FreeSpotPlan
			},

			get spot(): Spot {
				const { time, duration } = store
				return { ...spot, time, duration }
			},

			//Time changed and plan choosen
			get isChanged(): boolean {
				const current = Array.from(store.selected.values()).pop()
				//If plan not chosen and also current spot is free
				if (task === undefined && current === undefined) {
					return false
				}
				const planChanged = current?.id !== task?.plan.id
				console.log(current?.id, task?.plan.id)
				const timeChanged =
					spot.time !== store.time || spotEnd !== store.spotEnd
				return planChanged || timeChanged
			},
		}
	})

	return store
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

const PlanItem = ({ id, name }: IPlan, store: SpotManagerStore) => (
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
