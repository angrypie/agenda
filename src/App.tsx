import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, SafeAreaView } from 'react-native'
import { StoreProvider, rootStore } from 'models'

import { TaskList } from 'components/TaskList'

export default function App() {
	return (
		<StoreProvider value={rootStore}>
			<SafeAreaView style={styles.container}>
				<TaskList />
				<StatusBar style='auto' />
			</SafeAreaView>
		</StoreProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
