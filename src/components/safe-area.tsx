import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SafeView: React.FunctionComponent = ({ children }) => (
	<SafeAreaView
		style={{
			flex: 1,
			paddingLeft: 15,
			paddingRight: 15,
		}}
	>
		{children}
	</SafeAreaView>
)
