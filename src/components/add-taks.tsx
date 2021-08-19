import React from 'react'
import { Header } from 'components/text'
import {
	View,
	TextInput,
	ScrollView,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import { SafeView } from 'components/safe-area'
import { useStore } from 'models'
import { ModalHeader } from './layout'
import { observer, Observer, useLocalObservable } from 'mobx-react-lite'
import { Button } from './touchable'
import { Plan } from 'lib/spots/spot'
import Fuse from 'fuse.js'

function fuzzyPlansSort(source: Map<string, Plan>, name: string): Plan[] {
	const plans = Array.from(source.values())
	if (name === '') {
		return plans
	}
	//TODO use index to speedup process
	const f = new Fuse(plans, { keys: ['name'] })
	const result = f.search(name)

	return result.map(item => item.item).concat()
}

interface AddTaskStore {
	searchInput: string
	addPlan(): void
	setSearchInput(value: string): void
	isValidNewPlan: boolean
}

//TODO move react navigaiton dependencie outside
export function AddTaskScreen() {
	const { schedule } = useStore()
	const store = useLocalObservable(() => ({
		searchInput: '',
		setSearchInput(value: string) {
			store.searchInput = value
		},
		addPlan(): boolean {
			if (store.searchInput === '') {
				return false
			}
			schedule.addPlan(store.searchInput)
			store.setSearchInput('')
			return false
		},

		get isValidNewPlan(): boolean {
			console.log(store.searchInput !== '')
			console.log(schedule.plans.get(store.searchInput) === undefined)
			return (
				store.searchInput !== '' &&
				schedule.plans.get(store.searchInput) === undefined
			)
		},
	}))

	const removePlanAlert = (plan: Plan) =>
		Alert.alert('Delete Task', `Confirm removing\n '${plan.name}'`, [
			{
				text: 'Cancel',
				onPress: () => console.log('Cancel Pressed'),
				style: 'cancel',
			},
			{
				text: 'Remove',
				onPress: () => schedule.removePlan(plan.id),
				style: 'destructive',
			},
		])

	return (
		<SafeView>
			<Observer>
				{() => (
					<ModalHeader
						done={{
							name: 'Add',
							disabled: !store.isValidNewPlan,
							onPress: store.addPlan,
						}}
					/>
				)}
			</Observer>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<View
					style={{
						height: 100,
						justifyContent: 'center',
					}}
				>
					<InputName store={store} />
				</View>
				<View style={{ flex: 1 }}>
					<Observer>
						{() => (
							<ScrollView showsVerticalScrollIndicator={false}>
								{fuzzyPlansSort(schedule.plans, store.searchInput).map(plan => (
									<View key={plan.id} style={{ paddingVertical: 13 }}>
										<Button onPress={() => removePlanAlert(plan)}>
											<Header>{plan.name}</Header>
										</Button>
									</View>
								))}
							</ScrollView>
						)}
					</Observer>
				</View>
			</KeyboardAvoidingView>
		</SafeView>
	)
}

const InputName = observer(({ store }: { store: AddTaskStore }) => (
	<TextInput
		style={styles.input}
		autoCorrect={false}
		onChangeText={store.setSearchInput}
		keyboardAppearance='dark'
		returnKeyType='search'
		placeholder='Search or add task'
		placeholderTextColor='rgba(255,255,255,.2)'
		value={store.searchInput}
		autoFocus
	/>
))

const styles = StyleSheet.create({
	input: {
		color: 'rgba(255,255,255,.6)',
		fontSize: 36,
		fontWeight: 'bold' as 'bold',
	},
})
