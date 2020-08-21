import { Enumerate, EnumVariants } from 'lib/types'
import { parseTime } from 'lib/time'

type Features = number[]

interface Tag<T extends EnumVariants> {
	value: Enumerate<T>
	range: T
	bits: () => number[]
}

const newTag = <T extends Tag<EnumVariants>>(range: T['range']) => (
	value: T['value']
): T => {
	const bits = () => newFeatures(range, value)
	return { range, value, bits } as T
}

export type Month = Tag<12>
export const Month = newTag<Month>(12)

export type Weekday = Tag<7>
export const Weekday = newTag<Weekday>(7)

interface TimeTags {
	weekday: Weekday
	month: Month
}

export const timeToFeatures = (time: number): Features =>
	timeTagsToFeatures(getTimeTags(time))

function getTimeTags(time: number): TimeTags {
	const t = parseTime(time)
	return { month: Month(t.weekday), weekday: Weekday(t.weekday) }
}

const timeTagsToFeatures = (tags: TimeTags): Features => [
	...tags.weekday.bits(),
	...tags.month.bits(),
]

const newFeatures = (range: number, ...set: number[]): number[] => {
	const arr = new Array(range).fill(0)
	set.forEach(i => (arr[i] = 1))
	return arr
}
