import React, { useState } from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { isCurrentSpot, Spot } from 'lib/spots'
import { useStore, IPlan } from 'models'
import { FreeSpotPlan, NewTimeSpan, TimeSpan } from 'lib/spots/spot'
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
		const maxEnd = store.timespan.end
		//TODO setup slider to not allow such things
		store.setSpotEnd(end > store.timespan.end ? maxEnd : end)
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
								allowOverlap={false}
								snapped
								step={300000} //5 minutes step
								minMarkerOverlapStepDistance={2} // 2 times $step = 10 minutes min interval
							/>
						</View>
					</View>
					<Description />

					<ScrollView showsVerticalScrollIndicator={false}>
						<View>
							{Array.from(schedule.plans.values())
								.sort(p => (p.id === spot.plan ? -1 : 1)) //current plan on top
								.map(plan => PlanItem(plan, store))}
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
	const spotPlan = schedule.plans.get(spot.plan)
	const spotStart = spot.time
	const spotEnd = spot.end

	const [maxStart, maxEnd] = schedule.getTaskGaps(spot)

	const remainingTime =
		task === undefined ? remainingTimeSpan(clock.getCurrentTime(), spot) : spot

	const store = useLocalObservable(() => {
		const selected: [string, IPlan][] = []
		if (spotPlan !== undefined) {
			selected.push([spot.plan, spotPlan])
		}
		return {
			selected: new Map<string, IPlan>(selected),
			//Initil spot time span
			timespan: { start: maxStart, end: maxEnd },
			time: remainingTime.time,
			end: remainingTime.end,
			select(plan: IPlan) {
				const { id } = plan
				if (store.isSelected(id)) {
					store.selected.delete(id)
				} else {
					store.selected.clear()
					store.selected.set(id, plan)
				}
			},

			get spotEnd(): number {
				return store.end
			},

			setSpotStart(startTime: number) {
				store.time = startTime
			},

			setSpotEnd(endTime: number) {
				store.end = endTime
			},

			isSelected(id: string): boolean {
				return store.selected.has(id)
			},

			get current(): IPlan {
				return Array.from(store.selected.values()).pop() || FreeSpotPlan
			},

			get spot(): Spot {
				const { time, end } = store
				return { ...spot, time, end }
			},

			//Time changed and plan choosen
			get isChanged(): boolean {
				const current = Array.from(store.selected.values()).pop()
				//If plan not chosen and also current spot is free
				if (task === undefined && current === undefined) {
					return false
				}
				const planChanged = current?.id !== task?.plan.id
				const timeChanged =
					spotStart !== store.time || spotEnd !== store.spotEnd
				return planChanged || timeChanged
			},
		}
	})

	return store
}

const remainingTimeSpan = (now: number, span: TimeSpan): TimeSpan =>
	isCurrentSpot(now, span) ? NewTimeSpan(span).setTime(now).get() : span

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
