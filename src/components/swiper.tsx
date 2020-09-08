import React, { useRef } from 'react'
import { View, FlatList, Dimensions } from 'react-native'
import { useLocalStore, observer } from 'mobx-react-lite'

//TODO BUGS:
// - flickering if scrolling during scrollToIndex call

//TODO get rid of mobx and publish on github

//TODO
// - shift screens without scrollToIndex
// - add more screens on the fly and recycle them
// - use linked list instead indexes to avoid int overflow?

const { width } = Dimensions.get('window')
export const initSwiperScreens = (size: number) => {
	const half = Math.floor(size / 2)
	const diffs = [...Array(size).keys()].map((_, i) =>
		i < half ? -(half - i) : i - half
	)
	return diffs.map((index, i) => ({ index, key: i.toString() }))
}

interface SwiperProps {
	renderItem: (index: number) => React.ReactElement
}

export const Swiper = ({ renderItem }: SwiperProps) => {
	//TODO decide how many screens needed and solve problem with
	//multiple swipes lag when sreens buffer size is not enough
	const size = 9
	const half = Math.floor(size / 2)
	const ref = useRef<FlatList>(null)
	const store = useLocalStore(() => ({
		screens: initSwiperScreens(size),
		current: half,
		setCurrent(index: number) {
			const { current, screens } = store
			if (current === index) {
				return
			}
			const d = current - index
			//const forward = d === -1 || d > 1
			store.screens.forEach(
				(screen, i) => (screens[i] = { ...screen, index: screen.index - d })
			)

			const flatList = ref.current
			if (flatList === null) {
				return
			}
			//TODO do not scroll after each shift if screens buffer big enough
			flatList.scrollToIndex({ index: half, animated: false })
		},
	}))

	const shiftScreens = (index: number) => {
		store.setCurrent(index)
	}

	const onChanged = useRef(({ viewableItems }: any) => {
		if (viewableItems.length !== 1) {
			return
		}
		shiftScreens(viewableItems[0].index)
	})
	return (
		<FlatList
			ref={ref}
			onViewableItemsChanged={onChanged.current}
			data={store.screens}
			keyExtractor={item => item.key}
			renderItem={({ index }) => (
				<Screen renderItem={renderItem} store={store} index={index} />
			)}
			onScrollToIndexFailed={info => {
				//TODO what to do with such situation?
				console.log('failed', info.index)
			}}
			initialScrollIndex={half}
			getItemLayout={(_, index) => ({
				length: width,
				offset: width * index,
				index,
			})}
			pagingEnabled
			horizontal
		/>
	)
}

interface ScreenProps {
	index: number
	renderItem: (index: number) => React.ReactElement
	store: any
}

const Screen = observer(({ index, renderItem, store }: ScreenProps) => {
	return <View style={{ width }}>{renderItem(store.screens[index].index)}</View>
})
