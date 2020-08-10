//import { initSwiperDays } from './task-list'
import { shiftDay } from 'lib/time'
import dayjs from 'dayjs'

test('shiftDay forward and backward', () => {
	const now = dayjs().valueOf()

	const msPerDay = 1e3 * 3600 * 24

	Array.from(Array(10).keys()).forEach(i => {
		expect(shiftDay(now, i)).toBe(now + i * msPerDay)
		expect(shiftDay(now, -1 * i)).toBe(now - i * msPerDay)
	})
})
