import React from 'react'
import { View, FlatList, Dimensions } from 'react-native'
import { useLocalObservable, observer } from 'mobx-react-lite'
import { Arr, head, last, NewNotEmptyArray } from 'lib/collections'
import { times } from 'rambda'

//TODO BUGS:
// - flickering if scrolling during scrollToIndex call

//TODO get rid of mobx and publish on github

//TODO
// - shift screens without scrollToIndex
// - add more screens on the fly and recycle them
// - use linked list instead indexes to avoid int overflow?
//

const genUpdateFlag = (): string => Math.random().toString()
const getCenterIndex = (size: number) => Math.floor(size / 2)

export const initSwiperScreens = (size: number): Arr<{ index: number }> => {
	const center = getCenterIndex(size)
	const diffs = [...Array(size).keys()].map((_, i) =>
		i < center ? -(center - i) : i - center
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

const { width: windowWidth } = Dimensions.get('window')

export const Swiper = observer(({ renderItem }: SwiperProps) => {
	//TODO decide how many screens needed and solve problem with
	//multiple swipes lag when sreens buffer size is not enough
	const size = 9
	const centerIndex = getCenterIndex(size)
	const store = useLocalObservable(() => ({
		screens: initSwiperScreens(size),
		updateFlag: genUpdateFlag(),
		updateScreens(visibleIndex: number) {
			const { screens } = store
			if (centerIndex === visibleIndex) {
				return
			}
			const d = visibleIndex - centerIndex
			const forward = d > 0

			//addNewIndexes adding indexes to the start or tail of the screens list
			const addNewIndexes = (edge: number, add: (index: number) => void) =>
				times(i => add(edge + Math.sign(d) * (i + 1)), Math.abs(d))

			if (forward) {
				addNewIndexes(last(screens).index, index => {
					screens.push({ index })
					screens.shift()
				})
			} else {
				addNewIndexes(head(screens).index, index => {
					screens.unshift({ index })
					screens.pop()
				})
			}
			store.updateFlag = genUpdateFlag()
		},
	}))

	return (
		<FlatList
			showsHorizontalScrollIndicator={false}
			extraData={store.updateFlag}
			maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
			onScroll={event => {
				const offset = event.nativeEvent.contentOffset.x
				const index = Math.round(offset / windowWidth)
				console.log(offset)
				store.updateScreens(index)
			}}
			scrollEventThrottle={200} //TODO not working for android? (reanimated?)
			data={store.screens}
			keyExtractor={item => item.index.toString()}
			renderItem={({ index }) => (
				<Screen renderItem={renderItem} store={store} index={index} />
			)}
			initialScrollIndex={centerIndex}
			getItemLayout={(_, index) => ({
				length: windowWidth,
				offset: windowWidth * index,
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
		<View style={{ width: windowWidth }}>
			{renderItem(store.screens[index].index)}
		</View>
	)
}
