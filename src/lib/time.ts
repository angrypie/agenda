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
