import { newMonth, newWeekday } from 'lib/labels/tags'
import { Enum7, Enum12 } from 'lib/types/enumerate'
//import { Enumerate } from 'lib/types'

test('create new month tags', () => {
	Enum12.forEach(value => {
		const month = newMonth(value)
		expect(month.value).toBe(value)
		expect(month.range).toBe(12)
	})
})

test('create new weekday tags', () => {
	Enum7.forEach(value => {
		const day = newWeekday(value)
		expect(day.value).toBe(value)
		expect(day.range).toBe(7)
	})
})
