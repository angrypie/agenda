import React from 'react'
import {
	StyleSheet,
	TouchableOpacity,
	View,
	GestureResponderEvent,
	ViewStyle,
	TextStyle,
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

export interface ButtonProps {
	onPress: (event: GestureResponderEvent) => void
	children: React.ReactNode
	disabled?: boolean
}

export const Button = ({ disabled = false, ...rest }: ButtonProps) => (
	<TouchableOpacity
		style={{ opacity: disabled ? 0.3 : 1 }}
		disabled={disabled}
		{...rest}
	/>
)

export interface TextButtonProps extends ButtonProps {
	children: React.ReactText
	style?: TextStyle
}

//TODO increase touchable area
export const TextButton = ({ children, style, ...button }: TextButtonProps) => (
	<Button {...button}>
		<Text style={{ fontSize: 16, ...style }}>{children}</Text>
	</Button>
)

export interface DimProps {
	children: React.ReactNode
	dim?: boolean
	opacity?: number
}

export const Dim = ({ dim = true, opacity = 0.3, children }: DimProps) => (
	<View style={{ opacity: dim ? opacity : 1 }}>{children}</View>
)

export const ToggleHidden = ({
	visible,
	hidden,
}: {
	visible: React.ReactNode
	hidden: React.ReactNode
}) => {
	const [open, setOpen] = React.useState(false)
	return (
		<>
			<Button onPress={() => setOpen(!open)}>{visible}</Button>
			{open ? hidden : null}
		</>
	)
}

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
