import dayjs from 'dayjs'
import { Enum7, Enum12 } from './types/enumerate'

export function getUnixTimeMs(): number {
	return dayjs().valueOf()
}

export function formatDate(ms: number): string {
	return dayjs(ms).format('dddd, MMM D')
}

//TODO pass clock with today time as dependencies to
export const isToday = (ms: number): boolean => dayjs().isSame(ms, 'day')

export function formatTime(ms: number): string {
	return dayjs(ms).format('HH:mm')
}

export const shiftDay = (time: number, diff: number): number =>
	(t => (diff > 0 ? t.add(diff, 'day') : t.subtract(diff * -1, 'day')))(
		NewTime(time)
	).value()

interface TimeTags {
	weekday: Enum7
	month: Enum12
}

//getTimeTags get nttt
export const parseTime = (time: number): TimeTags => {
	const d = dayjs(time)
	const month = d.month() as Enum12
	const weekday = d.day() as Enum7

	if (Enum12[month] === undefined) {
		throw Error('dayjs returns invalid month index')
	}
	if (Enum7[weekday] === undefined) {
		throw Error('dayjs returns invalid weekday index')
	}
	return { weekday, month }
}

export const getDayStart = (time: number): number =>
	dayjs(time).startOf('day').valueOf()

export const endOfDayTime = (time: number): number =>
	dayjs(time).endOf('day').valueOf()

//TODO use RelativeTIme plugin for dayjs
export const formatDifference = (start: number, end: number): number =>
	dayjs(start).diff(end, 'hour')

export const NewTime = (time: number) => {
	const t = dayjs(time)
	return {
		add: nt(t.add.bind(t)),
		subtract: nt(t.subtract.bind(t)),
		dayEnd: nt(() => t.endOf('day')),
		dayStart: nt(() => t.startOf('day')),
		value: t.valueOf.bind(t),
	}
}

interface ValueOf {
	valueOf: () => number
}

//nt executes given function and calls NewTime  on valueOf method on result object
function nt<T extends (...args: any) => ValueOf>(
	fn: T
): (...args: Parameters<T>) => ReturnType<typeof NewTime> {
	return (...args: Parameters<T>[]) => NewTime(fn(...args).valueOf())
}
