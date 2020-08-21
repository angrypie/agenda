import { Month, Weekday } from 'lib/labels/tags'
import { Enum7, Enum12 } from 'lib/types/enumerate'
//import { Enumerate } from 'lib/types'

test('create new month tags', () => {
	Enum12.forEach((value, expected) => {
		const variant = Month(value)
		expect(variant.value).toBe(expected)
		expect(variant.range).toBe(12)
	})
})

test('create new weekday tags', () => {
	Enum7.forEach((value, expected) => {
		const variant = Weekday(value)
		expect(variant.value).toBe(expected)
		expect(variant.range).toBe(7)
	})
})
