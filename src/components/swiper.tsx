import React, { useRef } from 'react'
import { View, FlatList, Dimensions } from 'react-native'
import { useLocalStore, observer } from 'mobx-react-lite'
import { Arr, head, last, NewNotEmptyArray } from 'lib/collections'
import { useThrottleCallback } from 'lib/hooks'
import { times } from 'rambda'

//TODO BUGS:
// - flickering if scrolling during scrollToIndex call

//TODO get rid of mobx and publish on github

//TODO
// - shift screens without scrollToIndex
// - add more screens on the fly and recycle them
// - use linked list instead indexes to avoid int overflow?

const { width: contentWidth } = Dimensions.get('window')
export const initSwiperScreens = (size: number): Arr<{ index: number }> => {
	const half = Math.floor(size / 2)
	const diffs = [...Array(size).keys()].map((_, i) =>
		i < half ? -(half - i) : i - half
	)
	const result = NewNotEmptyArray(diffs.map(index => ({ index })))
	if (result === undefined) {
		throw Error('expected not empty array')
	}
	return result
}

interface SwiperProps {
	renderItem: (index: number) => React.ReactElement
}

export const Swiper = observer(({ renderItem }: SwiperProps) => {
	//TODO decide how many screens needed and solve problem with
	//multiple swipes lag when sreens buffer size is not enough
	const size = 9
	const half = Math.floor(size / 2)
	const ref = useRef<FlatList>(null)
	const store = useLocalStore(() => ({
		screens: initSwiperScreens(size),
		current: half,
		setCurrent(index: number) {
			console.log('index', index)
			const { current, screens } = store
			if (current === index) {
				return
			}
			const d = current - index
			console.log('current', current, index, d)
			const forward = d < 0

			if (forward) {
				const end = last(screens).index + 1
				times(i => screens.push({ index: end + i }), Math.abs(d))
				store.current = index
				console.log('forward')
			} else {
				const start = head(screens).index - 1
				times(i => {
					console.log('unshift')
					screens.unshift({
						index: start - i,
					})
					screens.pop()
				}, Math.abs(d))

				console.log('backward')
				//store.current = index + 1
			}
		},
	}))

	const shiftScreens = useThrottleCallback((index: number) => {
		store.setCurrent(index)
	}, 1)

	//console.log('update')
	return (
		<FlatList
			extraData={store.screens[0].index}
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				//autoscrollToTopThreshold: ,
			}}
			ref={ref}
			//onViewableItemsChanged={onChanged.current}
			onScroll={event => {
				const offset = event.nativeEvent.contentOffset.x
				const index = Math.round(offset / contentWidth)
				shiftScreens(index)
			}}
			scrollEventThrottle={5} //not working for onScroll
			data={store.screens}
			keyExtractor={item => item.index.toString()}
			renderItem={({ index }) => (
				<Screen renderItem={renderItem} store={store} index={index} />
			)}
			onScrollToIndexFailed={info => {
				//TODO what to do with such situation?
				console.log('failed', info.index)
			}}
			initialScrollIndex={half}
			getItemLayout={(_, index) => ({
				length: contentWidth,
				offset: contentWidth * index,
				index,
			})}
			pagingEnabled
			horizontal
		/>
	)
})

interface ScreenProps {
	index: number
	renderItem: (index: number) => React.ReactElement
	store: any
}

const Screen = ({ index, renderItem, store }: ScreenProps) => {
	return (
		<View style={{ width: contentWidth }}>
			{renderItem(store.screens[index].index)}
		</View>
	)
}
