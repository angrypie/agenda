import { types } from 'mobx-state-tree'
import dayjs from 'dayjs'

export const Clock = types
	.model({
		now: types.optional(types.integer, () => dayjs().valueOf()),
	})
	.actions(self => ({
		update() {
			self.now = dayjs().valueOf()
			console.log('update', self.now)
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
