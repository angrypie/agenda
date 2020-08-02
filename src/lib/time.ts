import dayjs from 'dayjs'

export function getUnixTimeMs(): number {
	return dayjs().valueOf()
}

export function formatDate(ms: number): string {
	return dayjs(ms).format('ss \t dddd, MMM D')
}

export function formatTime(ms: number): string {
	return dayjs(ms).format('HH:mm')
}
