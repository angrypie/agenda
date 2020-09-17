import React from 'react'
import { View } from 'react-native'
import { SafeView } from 'components/safe-area'
import { Text, Header } from 'components/text'
import { Spot } from 'lib/spots'
import { useStore, IPlan } from 'models'

export interface SpotManagerProps {
	spot: Spot
}

export const SpotManager = ({ spot }: SpotManagerProps) => {
	const { schedule } = useStore()

	const renderPlans = (plan: IPlan) => (
		<Header key={plan.id}>{plan.name}</Header>
	)

	const plansList = schedule.plans.map(renderPlans)
	return (
		<SafeView>
			<View>{plansList}</View>
		</SafeView>
	)
}
