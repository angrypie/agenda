import React from 'react'
import { View } from 'react-native'
import { TextButton } from 'components/touchable'
import { useNavigation } from '@react-navigation/native'

interface ModalHeaderProps {}

export const ModalHeader = ({}: ModalHeaderProps) => {
	const navigation = useNavigation()
	const goBack = () => navigation.goBack()

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 50,
			}}
		>
			<TextButton onPress={goBack}>Cancel</TextButton>
			<TextButton disabled onPress={goBack}>
				Done
			</TextButton>
		</View>
	)
}
