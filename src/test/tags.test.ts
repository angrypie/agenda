import { Month, Weekday } from 'lib/matcher/tags'
import { Enum7, Enum12 } from 'lib/types/enumerate'
import { newMatcher } from 'lib/matcher'
import { stubTasks } from 'models/root'

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

test('test matchig tasks by time', () => {
	const matcher = newMatcher()
	matcher.log(stubTasks)
	const tasks = matcher.match(1)

	expect(tasks.length).toBe(3)
})
