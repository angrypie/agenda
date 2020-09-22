import React from 'react'
import {
	StyleSheet,
	TouchableOpacity,
	View,
	GestureResponderEvent,
	ViewStyle,
} from 'react-native'
import { Text } from 'components/text'

export interface BorderAreaProps {
	text: string
	onPress: (event: GestureResponderEvent) => void
	style?: ViewStyle
}

export const BorderArea = ({ text, onPress, style }: BorderAreaProps) => {
	return (
		<TouchableOpacity activeOpacity={0.7} delayPressIn={100} onPress={onPress}>
			<View style={[styles.borderArea, style]}>
				<Text>{text}</Text>
			</View>
		</TouchableOpacity>
	)
}

export interface TextButtonProps {
	onPress: (event: GestureResponderEvent) => void
	children: React.ReactNode
}

export const TextButton = ({ onPress, children }: TextButtonProps) => (
	<TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
)

const styles = StyleSheet.create({
	borderArea: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderRadius: 5,
		borderStyle: 'dashed',
		height: 50,
		marginHorizontal: 5,
		borderColor: 'white',
	},
})
