import dayjs from 'dayjs'
import { Enum7, Enum12 } from './types/enumerate'

export function getUnixTimeMs(): number {
	return dayjs().valueOf()
}

//TODO remove 'ss' after finding better way to debug
export function formatDate(ms: number): string {
	return dayjs(ms).format('dddd, MMM D')
}

export function formatTime(ms: number): string {
	return dayjs(ms).format('HH:mm')
}

export const getDayStart = (time: number): number => {
	return dayjs(time).startOf('day').valueOf()
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

export const endOfDayTime = (now: number) => dayjs(now).endOf('day').valueOf()
