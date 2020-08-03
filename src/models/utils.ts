import { getEnv as getMstEnv, IAnyStateTreeNode } from 'mobx-state-tree'
import { getUnixTimeMs } from 'lib/time'

export interface IMstEnv {
	getUnixTimeMs: typeof getUnixTimeMs
}

export function getEnv(self: IAnyStateTreeNode): IMstEnv {
	return getMstEnv<IMstEnv>(self)
}

export function createEnv(): IMstEnv {
	return {
		getUnixTimeMs,
	}
}
