import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

const tasks = [
	{ name: 'Programming', time: '8:00', active: false },
	{ name: 'Workout', time: '12:30', active: true },
	{ name: 'Clean Home', time: '14:00', active: false },
	{ name: 'Pay Bills', time: '15:00', active: false },
]

export const TaskList = () => {
	return (
		<View>
			{tasks.map((task, i) => (
				<Task key={i} {...task} />
			))}
		</View>
	)
}

export const Task = ({ name, time, active }: any) => {
	const style = { opacity: active ? 1 : 0.5 }
	return (
		<View style={[styles.task, style]}>
			<Header>{name}</Header>
			<Header>{time}</Header>
		</View>
	)
}

const DefaultText = ({ children, style }: any) => (
	<Text style={{ color: 'white', ...style }}>{children}</Text>
)

const Header = ({ children }: any) => (
	<DefaultText style={{ fontWeight: 'bold', fontSize: 30 }}>
		{children}
	</DefaultText>
)

const styles = StyleSheet.create({
	task: {
		minWidth: 280,
		height: 100,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		opacity: 1,
	},
})
