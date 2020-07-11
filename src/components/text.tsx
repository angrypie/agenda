import React from 'react'
import { Text as NativeText } from 'react-native'

export const Text = ({ children, style }: any) => (
	<NativeText style={{ color: 'white', fontSize: 14, ...style }}>
		{children}
	</NativeText>
)
