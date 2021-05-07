import React, { useState } from 'react'
import { View } from 'react-native'

import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { TimeSpan } from 'lib/spots/spot'

export interface TimeRangeProps {
	values: [number, number]
	range: TimeSpan
	onValuesChange: (values: number[]) => void | undefined
}

export const TimeRange = ({
	values,
	range,
	onValuesChange,
}: TimeRangeProps) => {
	const [layoutWidth, setLayoutWidth] = useState(300)

	return (
		<View
			onLayout={event => setLayoutWidth(event.nativeEvent.layout.width)}
			style={{ marginLeft: 10 }}
		>
			<MultiSlider
				values={values}
				sliderLength={layoutWidth - 20}
				onValuesChange={onValuesChange}
				min={range.time}
				max={range.end}
				allowOverlap={false}
				step={300000} //5 minutes step
				minMarkerOverlapStepDistance={1} // 2 times $step = 10 minutes min interval
			/>
		</View>
	)
}
