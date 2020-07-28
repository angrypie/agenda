import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Button } from 'react-native'
import { StoreProvider, rootStore } from 'models'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { TaskList } from 'components/task-list'
import { DayFocus } from 'components/day-focus'

const Stack = createStackNavigator()

export default function App() {
	return (
		<NavigationContainer theme={DarkTheme}>
			<StoreProvider value={rootStore}>
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
					<Stack.Screen name='Today' component={TaskList} />
				</Stack.Navigator>
				<StatusBar style='light' />
			</StoreProvider>
		</NavigationContainer>
	)
}
