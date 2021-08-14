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

type MarkerGHContext = {
	startX: number
}

type SharedNumber = Animated.SharedValue<number>
type Range = [SharedNumber, SharedNumber]

const chooseNextPosition = (value: number, step: number = 1): number => {
	'worklet'
	const stepDiff = value % step
	const prev = value - stepDiff
	const next = prev + step
	return stepDiff > step / 2 ? next : prev
}

const useMarker = (current: SharedNumber, range: Range, step: number = 1) => {
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
					translateX: chooseNextPosition(current.value, step),
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
	onValuesChange: (values: number[]) => void
	formatValue: (value: number) => string
	width: number
	markerWidth: number
	step?: number
}

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

export const DefaultRangeSlider = (props: SliderProps) => {
	const slider = useRangeSlider(props)
	return <RangeSlider {...slider} />
}

export const RangeSlider = (props: SliderSharedValues) => {
	const { wrapRail, wrapStart, wrapEnd } = props
	return (
		<View>
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

export type SliderSharedValues = ReturnType<typeof useRangeSlider>

export const useRangeSlider = (props: SliderProps) => {
	const { formatValue, markerWidth } = props
	const layoutWidth = props.width - markerWidth * 2
	const ratio = (props.max - props.min) / layoutWidth
	const { step = ratio * 0.5 } = props //every half of pixel is a default step
	const positionStep = step / ratio
	const toPosition = (n: number) => (n - props.min) / ratio

	const toValue = (position: SharedNumber): number => {
		'worklet'
		return chooseNextPosition(position.value * ratio + props.min, step)
	}

	const min = useSharedValue(toPosition(props.min))
	const max = useSharedValue(toPosition(props.max) + markerWidth)
	const start = useSharedValue(toPosition(props.start))
	const endPos = useSharedValue(toPosition(props.end) + markerWidth)

	const startEdge = useDerivedValue(() => start.value + markerWidth)
	const end = useDerivedValue(() => endPos.value - markerWidth)

	const [wrapStart] = useMarker(start, [min, end], positionStep)
	const [wrapEnd] = useMarker(endPos, [startEdge, max], positionStep)

	useAnimatedReaction(
		() => [toValue(start), toValue(end)],
		value => runOnJS(props.onValuesChange)(value),
		[props.onValuesChange]
	)

	const [wrapRail] = useAnimatedRail([start, endPos])

	const startText = useDerivedValue(() => formatValue(toValue(start)))
	const endText = useDerivedValue(() => formatValue(toValue(end)))

	return { start, end, wrapRail, wrapStart, wrapEnd, startText, endText }
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
