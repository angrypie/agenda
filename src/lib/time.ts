import dayjs from 'dayjs'

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

export interface Day {
	year: number
	month: number
	day: number
}

export const getDayStart = (d: Day): number => {
	return dayjs().year(d.year).month(d.month).date(d.day).valueOf()
}
