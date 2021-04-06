import { Arr } from 'lib/collections'
import { getDefaultSleepSpot, newMatcher } from 'lib/matcher'
import { newSpotsRepository } from 'lib/repository'
import { siblingDaysSpan } from 'lib/spots'
import {
	NewFreeSpot,
	NewSleepSpot,
	NewTimeSpan,
	SleepSpotPlan,
	Spot,
} from 'lib/spots/spot'
import { formatTimeDebug, getUnixTimeMs, NewTime } from 'lib/time'
import { v4 as uuidv4 } from 'uuid'

const getHours = (a: number) => NewTime(a).get('hours')

test('test geting sleep suggestion without sleep history', () => {
	const t = NewTime(getUnixTimeMs()).dayStart()
	const spotsHistory: Spot[] = []
	const spotsSource = () => spotsHistory
	const spotsRepo = newSpotsRepository(spotsSource)
	const matcher = newMatcher(spotsRepo)

	const siblingDays = 2
	const totalDays = siblingDays * 2
	const freeSpots: Arr<Spot> = [
		NewFreeSpot({
			id: uuidv4(),
			...siblingDaysSpan(t.value(), siblingDays),
		}),
	]

	const suggestions = matcher.createSuggestedTasks(freeSpots)
	const onlySleepSpots = suggestions.filter(s => s.plan === SleepSpotPlan.id)

	expect(onlySleepSpots.length).toBe(totalDays)

	const sleepSpot = getDefaultSleepSpot(0)
	const hrsStart = getHours(sleepSpot.time)
	const hrsEnd = getHours(sleepSpot.end)

	onlySleepSpots.forEach(spot => {
		expect(getHours(spot.time)).toBe(hrsStart)
		expect(getHours(spot.end)).toBe(hrsEnd)
	})
})

const createSleepSpot = (time: number, end: number) =>
	NewSleepSpot({ id: uuidv4(), time, end })

test('test geting sleep suggestion with custom sleep history', () => {
	const t = NewTime(getUnixTimeMs()).dayStart()
	const spotsHistory: Spot[] = [
		createSleepSpot(t.add(20, 'hours').value(), t.add(10, 'hours').value()),
	]
	const spotsSource = () => spotsHistory
	const spotsRepo = newSpotsRepository(spotsSource)
	const matcher = newMatcher(spotsRepo)

	const siblingDays = 2
	const totalDays = siblingDays * 2 + 1
	const freeSpots: Arr<Spot> = [
		NewFreeSpot({
			id: uuidv4(),
			...siblingDaysSpan(t.value(), siblingDays),
		}),
	]

	const suggestions = matcher.createSuggestedTasks(freeSpots)
	const onlySleepSpots = suggestions.filter(s => s.plan === SleepSpotPlan.id)

	expect(onlySleepSpots.length).toBe(totalDays)
})
