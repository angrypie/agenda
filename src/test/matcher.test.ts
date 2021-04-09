import { Arr } from 'lib/collections'
import { newMatcher } from 'lib/matcher'
import { newSpotsRepository } from 'lib/repository'
import { siblingDaysSpan } from 'lib/spots'
import {
	NewFreeSpot,
	NewSleepSpot,
	NewTimeSpan,
	SleepSpotPlan,
	Spot,
} from 'lib/spots/spot'
import { getUnixTimeMs, NewTime } from 'lib/time'
import { pipe } from 'rambda'
import { v4 as uuidv4 } from 'uuid'

//sleepSuggestionCases matches sleep history to expected spot suggestion
//First item of test case contains history of sleeps,
//and second one expected sleep suggestion defined as [start, duration] tuple.
const sleepSuggestionCases = [
	//Without sleep history, expecting default sleep time
	[[], [23, 8]],
	//With one history sleep spot, same as default
	[[[23, 8]], [23, 8]],
	//With one history sleep spot, different from default
	[[[1, 9]], [1, 9]],
	//With one history sleep spot, different from default
	[
		[
			[20, 9],
			[23, 8],
			[20, 9],
		],
		[20, 9],
	],
] as [[number, number][], [number, number]][]

test.each(sleepSuggestionCases)(
	'test geting sleep with custom sleep history',
	(history, expected) => {
		const t = NewTime(getUnixTimeMs()).dayStart()
		const spotsHistory: Spot[] = history.map(([start, duration]) =>
			createSleepSpot(start, duration)
		)
		const spotsSource = () => spotsHistory
		const spotsRepo = newSpotsRepository(spotsSource)
		const matcher = newMatcher(spotsRepo)

		const siblingDays = 2
		const freeSpots: Arr<Spot> = [
			NewFreeSpot({
				id: uuidv4(),
				...siblingDaysSpan(t.value(), siblingDays),
			}),
		]

		const suggestions = matcher.createSuggestedTasks(freeSpots)
		const onlySleepSpots = suggestions.filter(s => s.plan === SleepSpotPlan.id)

		const minSleeps = siblingDays * 2
		expect(onlySleepSpots.length).toBeGreaterThanOrEqual(minSleeps)

		onlySleepSpots.forEach(spot => {
			const actualTime = [
				getHours(spot.time),
				msToHours(NewTimeSpan(spot).duration()),
			]
			expect(actualTime).toEqual(expected)
		})
	}
)

const getHours = (a: number) => NewTime(a).get('hours')
const msToHours = (msDuration: number) =>
	Math.floor(msDuration / 1000 / 60 / 60)

const createSleepSpot = (start: number, duration: number) =>
	pipe(
		NewTime,
		t => t.dayStart().add(start, 'hours'),
		t =>
			NewSleepSpot({
				id: uuidv4(),
				time: t.value(),
				end: t.add(duration, 'hours').value(),
			})
	)(getUnixTimeMs()) //TODO use different days instead of current time
