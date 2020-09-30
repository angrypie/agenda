import React from 'react'
import 'react-native-get-random-values'
import { StatusBar } from 'expo-status-bar'
import { Button } from 'react-native'
import { StoreProvider, rootStore } from 'models'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { TaskListScreen } from 'components/task-list'
import { DayFocusScreen } from 'components/day-focus'
import { AddTaskScreen } from 'components/add-taks'
import { SpotManager } from 'components/spot-manager'
import { RootScreenParams, RootScreensProps } from 'navigation'

const MainStack = createStackNavigator()
const RootStack = createStackNavigator<RootScreenParams>()

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
		<RootStack.Navigator screenOptions={{ headerShown: false }} mode='modal'>
			<RootStack.Screen
				name='Main'
				component={MainStackScreen}
				options={{ headerShown: false, title: 'Agenda' }}
			/>
			<RootStack.Screen
				options={{ title: 'Add Task' }}
				name='AddTaskModal'
				component={AddTaskScreen}
			/>
			<RootStack.Screen
				options={{ title: 'Schedule Task' }}
				name='SpotManager'
				component={SpotManagerScreen}
			/>
		</RootStack.Navigator>
	)
}

const SpotManagerScreen = (props: RootScreensProps['SpotManager']) => (
	<SpotManager {...props.route.params} />
)

function MainStackScreen() {
	return (
		<MainStack.Navigator
			screenOptions={{ headerShown: false }}
			initialRouteName='Today'
		>
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
