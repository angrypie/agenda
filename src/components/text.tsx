import React from 'react'
import {
	Text as NativeText,
	TextStyle,
	TextProps as NativeTextProps,
	TextInput,
	StyleSheet,
} from 'react-native'

import Animated, { useAnimatedProps } from 'react-native-reanimated'

const styles = StyleSheet.create({
	text: {
		color: 'white',
		fontWeight: '500',
	},
})

export const Text = ({ children, style, animated }: TextProps) =>
	animated ? (
		<AnimatedText style={[styles.text, style]} text={animated} />
	) : (
		<NativeText style={[styles.text, style]}>{children}</NativeText>
	)

interface TextProps {
	children?: React.ReactNode
	style?: TextStyle
	animated?: Readonly<Animated.SharedValue<string>>
}

export const Header = ({ children, style, ...props }: TextProps) => (
	<Text style={{ fontWeight: 'bold', fontSize: 30, ...style }} {...props}>
		{children}
	</Text>
)

Animated.addWhitelistedNativeProps({ text: true })

interface AnimatedTextProps {
	text: Animated.SharedValue<string>
	style?: Animated.AnimateProps<TextStyle, NativeTextProps>['style']
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const AnimatedText = (props: AnimatedTextProps) => {
	const { text, style } = { style: {}, ...props }
	const animatedProps = useAnimatedProps(() => {
		return {
			text: text.value,
		} as any
	})
	return (
		<AnimatedTextInput
			underlineColorAndroid='transparent'
			editable={false}
			value={text.value}
			style={style}
			{...{ animatedProps }}
		/>
	)
}
