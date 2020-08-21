//import { initSwiperDays } from './task-list'
import { shiftDay, parseTime } from 'lib/time'
import dayjs from 'dayjs'

test('shiftDay forward and backward', () => {
	const now = dayjs().valueOf()

	const msPerDay = 1e3 * 3600 * 24

	Array.from(Array(10).keys()).forEach(i => {
		expect(shiftDay(now, i)).toBe(now + i * msPerDay)
		expect(shiftDay(now, -1 * i)).toBe(now - i * msPerDay)
	})
})

//TODO havy test this stuf due to type casting
test('parseTime on random time', () => {
	for (let i = 0; i < 100; i++) {
		const ms = randomMs()
		const d = dayjs(ms)
		const tags = parseTime(ms)
		expect(tags.month).toBe(d.month())
		expect(tags.weekday).toBe(d.day())
	}
})

function randomMs(): number {
	return Math.round(Date.now() * Math.random())
}
