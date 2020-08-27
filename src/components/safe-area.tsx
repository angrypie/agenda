import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SafeView: React.FunctionComponent = ({ children }) => (
	<SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
)
