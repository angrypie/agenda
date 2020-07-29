import { useContext, createContext } from 'react'
import 'mobx-react-lite/batchingForReactNative'
import { RootModel } from './root'
import { Instance } from 'mobx-state-tree'
export { rootStore } from './root'

export type RootInstance = Instance<typeof RootModel>
const storeContext = createContext<null | RootInstance>(null)

export function useStore() {
	const store = useContext(storeContext)
	if (store === null) {
		throw new Error('Store cannot be null, please add a StoreProvider')
	}
	return store
}

export const StoreProvider = storeContext.Provider

export * from './schedule'
