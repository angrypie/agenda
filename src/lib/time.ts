import dayjs from 'dayjs'
import { Enum7, Enum12 } from './types/enumerate'

export function getUnixTimeMs(): number {
	return dayjs().valueOf()
}

//TODO remove 'ss' after finding better way to debug
export function formatDate(ms: number): string {
	return dayjs(ms).format('dddd, MMM D')
}

//TODO pass clock with today time as dependencies to
export const isToday = (ms: number): boolean => dayjs().isSame(ms, 'day')

export function formatTime(ms: number): string {
	return dayjs(ms).format('HH:mm')
}

//TODO refactor this :)
export const shiftDay = (time: number, diff: number): number =>
	diff > 0
		? dayjs(time).add(diff, 'day').valueOf()
		: dayjs(time)
				.subtract(diff * -1, 'day')
				.valueOf()

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
