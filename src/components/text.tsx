import React from 'react'
import { Text as NativeText } from 'react-native'

export const Text = ({ children, style }: any) => (
	<NativeText style={{ color: 'white', fontWeight: '500', ...style }}>
		{children}
	</NativeText>
)
