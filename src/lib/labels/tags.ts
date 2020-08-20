import { Enumerate, EnumVariants } from 'lib/types'

//type TimeFeatures = number[]

//const tag = <T extends number>(range: T) => {
//return (value: T) => ({
//value,
//toFeatures() {
//const arr = new Array(range).fill(0)
//arr[value] = 1
//return arr
//},
//})
//}

interface Tag<T extends EnumVariants> {
	value: Enumerate<T>
	range: T
}

interface IValue {
	value: any
}

const newtag = <T extends IValue>(tag: T) => (value: T['value']): T => {
	tag.value = value
	return tag
}

type Month = Tag<12>
export const newMonth = newtag({ range: 12 } as Month)

type Weekday = Tag<7>
export const newWeekday = newtag({ range: 7 } as Weekday)

//interface TimeTags {
//weekday: WeekdayTag
//month: MonthTag
//}

//export const timeToFeatures = (time: number): number[] =>
//timeTagsToFeatures(getTimeTags(time))

//function getTimeTags(time: number): TimeTags {
//return { weekday: 3, month: 8 }
//}

//export function timeTagsToFeatures(tags: TimeTags): TimeFeatures {
//tag(12)
//return [...tag(tags.weekday), ...tagToFeatures(tags.month)]
//}

const newFeatures = (range: number, ...set: number[]) => {
	const arr = new Array(range).fill(0)
	set.forEach(i => (arr[i] = 1))
	return arr
}
