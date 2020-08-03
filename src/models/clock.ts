import { types } from 'mobx-state-tree'

export const Clock = types
	.model({
		now: types.optional(types.integer, 0),
	})
	.actions(self => ({
		update(currentTime: number) {
			self.now = currentTime
		},
	}))
