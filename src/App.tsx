import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Button, View, Text } from 'react-native'
import { StoreProvider, rootStore } from 'models'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { TaskListScreen } from 'components/task-list'
import { DayFocus } from 'components/day-focus'

const Stack = createStackNavigator()
const RootStack = createStackNavigator()

export default function App() {
	return (
		<NavigationContainer theme={DarkTheme}>
			<StoreProvider value={rootStore}>
				<RootStack.Navigator mode='modal'>
					<RootStack.Screen
						name='Main'
						component={MainStackScreen}
						options={{ headerShown: false }}
					/>
					<RootStack.Screen name='MyModal' component={ModalScreen} />
				</RootStack.Navigator>
				<StatusBar style='light' />
			</StoreProvider>
		</NavigationContainer>
	)
}

function ModalScreen({ navigation }: any) {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text style={{ fontSize: 30 }}>This is a modal!</Text>
			<Button onPress={() => navigation.goBack()} title='Dismiss' />
		</View>
	)
}

function MainStackScreen() {
	return (
		<Stack.Navigator initialRouteName='Focus'>
			<Stack.Screen
				name='Focus'
				component={DayFocus}
				options={({ navigation }) => ({
					headerRight: () => (
						<Button
							onPress={() => navigation.navigate('Today')}
							title='Today'
						/>
					),
				})}
			/>
			<Stack.Screen name='Today' component={TaskListScreen} />
		</Stack.Navigator>
	)
}
