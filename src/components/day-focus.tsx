import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'components/text'
import { Task } from 'components/task-list'

//TODO pass data to Task component
export const DayFocus = () => {
	return (
		<View style={styles.dayFocus}>
			<View>
				<Text>12:30</Text>
			</View>
			<View>
				<Task />
			</View>

			<View>
				<Text>18:30</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	dayFocus: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
