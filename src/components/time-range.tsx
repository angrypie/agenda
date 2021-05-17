import React from 'react'
import { StyleSheet, View } from 'react-native'

import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	useDerivedValue,
	useAnimatedReaction,
	runOnJS,
} from 'react-native-reanimated'
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import { Text } from './text'

type MarkerGHContext = {
	startX: number
}

type SharedNumber = Animated.SharedValue<number>
type Range = [SharedNumber, SharedNumber]

const useMarker = (current: SharedNumber, range: Range) => {
	const [min, max] = range

	const gestureHandler = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		MarkerGHContext
	>({
		onStart: (_, ctx) => {
			ctx.startX = current.value
		},
		onActive: (event, ctx) => {
			current.value = Math.min(
				max.value,
				Math.max(min.value, ctx.startX + event.translationX)
			)
		},
	})

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: current.value,
				},
			],
		}
	})

	const wrapX = (children: React.ReactChild) => (
		<PanGestureHandler onGestureEvent={gestureHandler}>
			<Animated.View style={animatedStyle}>{children}</Animated.View>
		</PanGestureHandler>
	)

	return [wrapX] as const
}

interface SliderProps {
	start: number
	end: number
	min: number
	max: number
	onValuesChange: (values: number[]) => void | undefined
}

export const TimeRangeSlider = (props: SliderProps) => (
	<RangeSlider {...props} />
)

const useAnimatedRail = (range: Range) => {
	const [start, end] = range
	const animatedStyle = useAnimatedStyle(() => {
		const diff = end.value - start.value
		return {
			transform: [{ translateX: start.value + diff / 2 }, { scaleX: diff }],
		}
	})

	const wrapRail = () => (
		<View
			style={{
				height: 2,
				backgroundColor: 'gray',
			}}
		>
			<Animated.View
				style={[
					animatedStyle,
					{
						height: 2,
						width: 1,
						backgroundColor: 'red',
					},
				]}
			/>
		</View>
	)

	return [wrapRail] as const
}

export function formatTimeWorklet(ms: number): string {
	'worklet'
	return new Date(ms).toLocaleString('en-US', {
		hour: 'numeric', // numeric, 2-digit
		minute: 'numeric', // numeric, 2-digit
	})
}

export const RangeSlider = (props: SliderProps) => {
	const layoutWidth = 300
	const ratio = (props.max - props.min) / layoutWidth

	const toPosition = (n: number) => (n - props.min) / ratio

	const start = useSharedValue(toPosition(props.start))
	const end = useSharedValue(toPosition(props.end))
	const min = useSharedValue(toPosition(props.min))
	const max = useSharedValue(toPosition(props.max))

	const [wrapStart] = useMarker(start, [min, end])
	const [wrapEnd] = useMarker(end, [start, max])

	//(start.value * ratio + props.min).toString()
	const startText = useDerivedValue(() => {
		return formatTimeWorklet(start.value * ratio + props.min)
	})
	const endText = useDerivedValue(() => {
		return formatTimeWorklet(end.value * ratio + props.min)
	})

	useAnimatedReaction(
		() => [start.value * ratio + props.min, end.value * ratio + props.min],
		value => runOnJS(props.onValuesChange)(value),
		[props.onValuesChange]
	)

	const [wrapRail] = useAnimatedRail([start, end])

	return (
		<View>
			<View>
				<Text animated={startText} />
				<Text animated={endText} />
			</View>
			<View
				style={{
					height: 30,
					justifyContent: 'center',
				}}
			>
				{wrapRail()}
				{wrapStart(<Marker color='orange' />)}
				{wrapEnd(<Marker color='green' />)}
			</View>
		</View>
	)
}

export const Marker = ({ color }: { color: string }) => {
	return (
		<View
			style={[
				{
					...StyleSheet.absoluteFillObject,
					height: 30,
					top: -15,
					width: 30,
					backgroundColor: color,
					borderRadius: 15,
				},
			]}
		/>
	)
}
