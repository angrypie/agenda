import React, { useState } from 'react'
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeView } from 'components/safe-area'

export function AddTaskScreen({ navigation }: any) {
	return (
		<SafeView>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<View
					style={{
						flex: 1,
						alignItems: 'stretch',
						justifyContent: 'center',
					}}
				>
					<InputName />
					<View style={{ height: 100 }} />
				</View>
			</KeyboardAvoidingView>
		</SafeView>
	)
}

const InputName = () => {
	const [value, onChangeText] = useState('')

	return (
		<TextInput
			style={styles.input}
			onChangeText={(text: string) => onChangeText(text)}
			keyboardAppearance='dark'
			returnKeyType='done'
			placeholder='Task name...'
			placeholderTextColor='rgba(255,255,255,.2)'
			value={value}
			autoFocus
		/>
	)
}

const styles = {
	input: {
		color: 'rgba(255,255,255,.6)',
		fontSize: 36,
		fontWeight: 'bold' as 'bold',
	},
}
