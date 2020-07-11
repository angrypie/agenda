import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, SafeAreaView, View } from 'react-native'

import { TaskList } from 'components/TaskList'

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<TaskList />
			<StatusBar style='auto' />
		</SafeAreaView>
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
