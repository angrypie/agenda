import React from 'react'
import { View } from 'react-native'
import { TextButton } from 'components/touchable'
import { useNavigation } from '@react-navigation/native'

interface ModalHeaderProps {
	done?: {
		disabled: boolean
		onPress: () => boolean
		name?: string
	}
}

export const ModalHeader = ({ done }: ModalHeaderProps) => {
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
			{done === undefined ? null : (
				<TextButton
					disabled={done.disabled}
					onPress={() => done.onPress() && goBack()}
				>
					{done.name || 'Done'}
				</TextButton>
			)}
		</View>
	)
}
