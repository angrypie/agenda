import React from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { Spot } from 'lib/spots'
import { useStore, IPlan } from 'models'
import { timeSpanEnd } from 'lib/spots/spot'
import { TaskHeader } from './task'
import { AddTask } from './task-list'
import { ModalHeader } from './layout'
import { useObserver, useLocalStore } from 'mobx-react-lite'
import { Button } from './touchable'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()

	const store = useLocalStore(() => ({
		selected: new Map<string, IPlan>(),

		select(plan: IPlan) {
			const { id } = plan
			if (this.isSelected(id)) {
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

		get isEmpty() {
			return store.selected.size === 0
		},

		get currentName(): string {
			const current = Array.from(store.selected.values()).pop()
			return current === undefined ? '' : current.name
		},
	}))

	const renderPlans = ({ id, name }: IPlan) =>
		useObserver(() => (
			<Button onPress={() => store.select({ id, name })}>
				<Header
					style={{
						opacity: store.isSelected(id) ? 1 : 0.8,
						paddingVertical: 13,
					}}
					key={id}
				>
					{name}
				</Header>
			</Button>
		))

	const plansList = schedule.plans.map(renderPlans)
	const spotEnd = timeSpanEnd(spot)
	return useObserver(() => (
		<SafeView>
			<ModalHeader done={{ disabled: store.isEmpty, onPress: () => true }} />
			<View style={{ opacity: 0.6 }}>
				<TaskHeader name={store.currentName} time={spot.time} />
				<DashedSeparator />
				<TaskHeader name='' time={spotEnd} />
			</View>
			<Description />

			<ScrollView>
				<View>{plansList}</View>
			</ScrollView>
		</SafeView>
	))
}

const DashedSeparator = () => <View style={styles.dashedSeparator} />

const Description = () => (
	<View style={styles.description}>
		<Text style={{ opacity: 0.6, fontSize: 15 }}>
			Assign existing or add new task
		</Text>
		<AddTask />
	</View>
)

const styles = StyleSheet.create({
	dashedSeparator: {
		height: 35,
		borderBottomWidth: 1,
		borderColor: 'white',
		borderStyle: 'dashed',
	},
	description: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 30,
		marginTop: 25,
		marginBottom: 10,
	},
})
