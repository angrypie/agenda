import { types } from 'mobx-state-tree'
import { getDayStart } from 'lib/time'

export const Clock = types
	.model({
		now: types.optional(types.integer, 0),
		today: types.optional(types.integer, 0),
	})
	.actions(self => ({
		update(currentTime: number) {
			self.now = currentTime
			self.today = getDayStart(currentTime)
		},
	}))
