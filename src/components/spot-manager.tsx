import React from 'react'
import { View } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text } from 'components/text'
import { Spot } from 'lib/spots'

export const SpotManager = ({ spot }: { spot: Spot }) => {
	return (
		<SafeView>
			<View>
				<Text>{spot.id}</Text>
			</View>
		</SafeView>
	)
}
