import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Button } from 'react-native'
import { StoreProvider, rootStore } from 'models'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { TaskListScreen } from 'components/task-list'
import { DayFocusScreen } from 'components/day-focus'
import { AddTaskScreen } from 'components/add-taks'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

export default function App() {
	return (
		<SafeAreaProvider>
			<NavigationContainer theme={DarkTheme}>
				<StoreProvider value={rootStore}>
					<RootStackScreen />
					<StatusBar style='light' />
				</StoreProvider>
			</NavigationContainer>
		</SafeAreaProvider>
	)
}

function RootStackScreen() {
	return (
		<RootStack.Navigator mode='modal'>
			<RootStack.Screen
				name='Main'
				component={MainStackScreen}
				options={{ headerShown: false }}
			/>
			<RootStack.Screen name='AddTaskModal' component={AddTaskScreen} />
		</RootStack.Navigator>
	)
}

function MainStackScreen() {
	return (
		<MainStack.Navigator initialRouteName='Today'>
			<MainStack.Screen
				name='Focus'
				component={DayFocusScreen}
				options={({ navigation }) => ({
					headerRight: () => (
						<Button
							onPress={() => navigation.navigate('Today')}
							title='Today'
						/>
					),
				})}
			/>
			<MainStack.Screen name='Today' component={TaskListScreen} />
		</MainStack.Navigator>
	)
}
