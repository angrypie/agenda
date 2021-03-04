import { Spot } from './spots'
import { formatTime } from './time'

export const logSpotsList = (spots: Spot[]) =>
	console.log(
		['Log Spots List']
			.concat(
				spots.map(s => `${formatTime(s.time)} - ${formatTime(s.end)} ${s.name}`)
			)
			.join(`\n`)
	)
