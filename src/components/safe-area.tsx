import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SafeAreaPadding = 15

export const SafeView: React.FunctionComponent = ({ children }) => (
	<SafeAreaView
		style={{
			flex: 1,
			paddingLeft: SafeAreaPadding,
			paddingRight: SafeAreaPadding,
		}}
	>
		{children}
	</SafeAreaView>
)
