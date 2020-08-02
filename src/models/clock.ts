import { types } from 'mobx-state-tree'
import { getUnixTimeMs } from 'lib/time'

export const Clock = types
	.model({
		now: types.optional(types.integer, () => getUnixTimeMs()),
	})
	.actions(self => ({
		update() {
			self.now = getUnixTimeMs()
		},
	}))
	.actions(function (self) {
		let timer: number

		return {
			afterCreate() {
				timer = setInterval(() => self.update(), 1000)
			},
			beforeDestroy() {
				clearInterval(timer)
			},
		}
	})
