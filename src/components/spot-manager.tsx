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
import { useLocalStore, Observer } from 'mobx-react-lite'
import { Button } from './touchable'
import { Styles } from 'lib/style'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()
	const task = schedule.tasks.find(task => task.id === spot.id)
	const store = useLocalStore(() => {
		const selected: [string, IPlan][] = []
		if (task !== undefined) {
			selected.push([task.plan.id, task.plan])
		}
		return {
			selected: new Map<string, IPlan>(selected),

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
				const current = Array.from(store.selected.values()).pop()
				return current || FreeSpotPlan
			},

			get isChanged() {
				const current = Array.from(store.selected.values()).pop()
				return current?.id !== task?.plan.id
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

	const spotEnd = timeSpanEnd(spot)
	const doneButton = () => schedule.updateTask(spot, store.current)
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
						<TaskHeader name={store.current.name} time={spot.time} />
						<SpotsSeparator />
						<TaskHeader name='' time={spotEnd} />
					</View>
					<Description />

					<ScrollView>
						<View>{schedule.plans.map(renderPlans)}</View>
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
