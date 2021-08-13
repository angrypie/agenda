import React, { useState } from 'react'
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
import { useNavigation } from '@react-navigation/native'
import { ModalHeader } from './layout'
import { Observer } from 'mobx-react-lite'
import { Button } from './touchable'
import { Plan } from 'lib/spots/spot'

//TODO move react navigaiton dependencie outside
export function AddTaskScreen() {
	const { schedule } = useStore()

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
			<ModalHeader />
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
					<InputName />
				</View>
				<View style={{ flex: 1 }}>
					<Observer>
						{() => (
							<ScrollView showsVerticalScrollIndicator={false}>
								{Array.from(schedule.plans.values()).map(plan => (
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

const InputName = () => {
	const [value, setValue] = useState('')
	const { schedule } = useStore()
	const addPlan = () => {
		if (value === '') {
			return
		}
		schedule.addPlan(value)
		setValue('')
	}

	return (
		<TextInput
			style={styles.input}
			onChangeText={(text: string) => setValue(text)}
			keyboardAppearance='dark'
			returnKeyType='done'
			placeholder='Search or add task'
			placeholderTextColor='rgba(255,255,255,.2)'
			value={value}
			onSubmitEditing={addPlan}
			autoFocus
		/>
	)
}

const styles = StyleSheet.create({
	input: {
		color: 'rgba(255,255,255,.6)',
		fontSize: 36,
		fontWeight: 'bold' as 'bold',
	},
})
