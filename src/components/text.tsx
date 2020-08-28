import React from 'react'
import { Text as NativeText, TextStyle } from 'react-native'

export const Text = ({ children, style }: TextProps) => (
	<NativeText style={{ color: 'white', fontWeight: '500', ...style }}>
		{children}
	</NativeText>
)

interface TextProps {
	children: React.ReactNode
	style?: TextStyle
}

export const Header = ({ children, style }: TextProps) => (
	<Text style={{ fontWeight: 'bold', fontSize: 30, ...style }}>{children}</Text>
)
