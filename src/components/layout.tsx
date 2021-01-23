import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated'
import { TextButton } from 'components/touchable'

interface ModalHeaderProps {
	done?: {
		disabled: boolean
		onPress: () => boolean
		name?: string
	}
}

export const ModalHeader = ({ done }: ModalHeaderProps) => {
	const navigation = useNavigation()
	const goBack = () => navigation.goBack()

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 50,
			}}
		>
			<TextButton onPress={goBack}>Cancel</TextButton>
			{done === undefined ? null : (
				<TextButton
					disabled={done.disabled}
					onPress={() => done.onPress() && goBack()}
				>
					{done.name || 'Done'}
				</TextButton>
			)}
		</View>
	)
}

interface BlinkingProps {
	children: React.ReactNode
	style?: ViewStyle
}

export const Blinking = ({ children, style }: BlinkingProps) => {
	const opacity = useSharedValue(40)

	React.useEffect(() => {
		opacity.value = withRepeat(withTiming(100, { duration: 2000 }), -1, true)
	}, [])

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value / 100,
		}
	})

	return (
		<Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
	)
}
