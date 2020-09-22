import React from 'react'
import { ScrollView, View } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { Spot } from 'lib/spots'
import { useStore, IPlan } from 'models'
import { formatDifference, formatTime } from 'lib/time'
import { timeSpanEnd } from 'lib/spots/spot'
import { TaskHeader } from './task'
import { AddTask } from './task-list'
import { useNavigation } from '@react-navigation/native'
import { TextButton } from './touchable'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()

	const renderPlans = (plan: IPlan) => (
		<Header style={{ paddingVertical: 13 }} key={plan.id}>
			{plan.name}
		</Header>
	)

	const plansList = schedule.plans.map(renderPlans)
	const spotEnd = timeSpanEnd(spot)
	const hoursDiff = formatDifference(spotEnd, spot.time)
	return (
		<SafeView>
			<ModalHeader />
			<View style={{ opacity: 0.6 }}>
				<TaskHeader name='' time={spot.time} />
				<DashedSeparator />
				<TaskHeader name='' time={spotEnd} />
			</View>

			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: 30,
					marginTop: 25,
					marginBottom: 10,
				}}
			>
				<Text style={{ opacity: 0.6, fontSize: 15 }}>
					Assign existing or add new task
				</Text>
				<AddTask />
			</View>
			<ScrollView>
				<View style={{ opacity: 0.8 }}>{plansList}</View>
			</ScrollView>
		</SafeView>
	)
}

const DashedSeparator = () => (
	<View
		style={{
			height: 35,
			borderBottomWidth: 1,
			borderColor: 'white',
			borderStyle: 'dashed',
		}}
	/>
)

const ModalHeader = () => {
	const navigation = useNavigation()
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 50,
			}}
		>
			<TextButton onPress={navigation.goBack}>
				<Text style={{ fontSize: 16 }}>Cancel</Text>
			</TextButton>
			<Text style={{ opacity: 0.4, fontSize: 16 }}>Done</Text>
		</View>
	)
}
