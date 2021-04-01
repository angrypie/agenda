import { Spot } from './spots'

export interface SpotsRepository {
	getByPlan(planId: string): Spot[]
}

export const newSpotsRepository = (spots: () => Spot[]): SpotsRepository => {
	return {
		getByPlan(planId: string): Spot[] {
			return spots().filter(spot => spot.plan === planId)
		},
	}
}
