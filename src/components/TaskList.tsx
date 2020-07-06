import React from 'react'
import { Text, View } from 'react-native'

export const Task = ({ name, time }: any) => {
	return (
		<View>
			<Text>{name}</Text>
			<Text>{time}</Text>
		</View>
	)
}

const tasks = [
	{ name: 'Clean home', time: '12:30' },
	{ name: 'Pay bills', time: '14:30' },
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
