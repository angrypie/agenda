import { onSnapshot, applySnapshot, IStateTreeNode } from 'mobx-state-tree'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface IArgs {
	(name: string, store: IStateTreeNode, options?: IOptions): Promise<void>
}
export interface IOptions {
	readonly whitelist?: string[]
	readonly blacklist?: string[]
}

export const persist: IArgs = async (name, store, options = {}) => {
	const { whitelist, blacklist } = options
	//TODO why AsyncStorage is deprecated
	const storage = AsyncStorage

	const whitelistDict = arrToDict(whitelist)
	const blacklistDict = arrToDict(blacklist)

	onSnapshot(store, _snapshot => {
		// need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
		const snapshot = { ..._snapshot }
		Object.keys(snapshot).forEach(key => {
			if (whitelist && !whitelistDict[key]) {
				delete snapshot[key]
			}
			if (blacklist && blacklistDict[key]) {
				delete snapshot[key]
			}
		})

		const data = JSON.stringify(snapshot)
		storage.setItem(name, data)
	})

	return storage.getItem(name).then((data: string | null) => {
		//don't apply falsey (which will error), leave store in initial state
		if (data === null) {
			return
		}
		const snapshot = JSON.parse(data)
		applySnapshot(store, snapshot)
	})
}

type StrToBoolMap = { [key: string]: boolean }

function arrToDict(arr?: string[]): StrToBoolMap {
	if (!arr) {
		return {}
	}
	return arr.reduce((dict: StrToBoolMap, elem) => {
		dict[elem] = true
		return dict
	}, {})
}
