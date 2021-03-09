import { Spot } from './spots'
import { formatTimeDebug } from './time'

export const logSpotsList = (spots: Spot[]) =>
	console.log(
		['Log Spots List']
			.concat(
				spots.map(
					s =>
						`${formatTimeDebug(s.time)} - ${formatTimeDebug(s.end)} ${s.name}`
				)
			)
			.join(`\n`)
	)
