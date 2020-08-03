import { types } from 'mobx-state-tree'
import { getEnv } from './utils'

export const Clock = types
	.model({
		now: types.optional(types.integer, 0),
	})
	.actions(self => ({
		update() {
			self.now = getEnv(self).getUnixTimeMs()
		},
	}))
	.actions(function (self) {
		let timer: number

		return {
			//TODO update clock from outside
			afterCreate() {
				timer = setInterval(() => self.update(), 1000)
			},
			beforeDestroy() {
				clearInterval(timer)
			},
		}
	})
