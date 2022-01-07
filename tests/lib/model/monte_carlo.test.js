import { jest } from '@jest/globals'
jest.retryTimes(3)

import MCAgent from '../../../lib/model/monte_carlo.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('default', () => {
	const env = new GridRLEnvironment()
	const agent = new MCAgent(env, env.size[0])

	const totalRewards = []
	const n = 1000
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalRewards[i] = 0
		let cnt = 0
		while (cnt++ < 10000) {
			const action = agent.get_action(curState, 1 - (i / n) ** 2)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, reward, done)
			totalRewards[i] += reward
			curState = state
			if (done) {
				break
			}
		}
		agent.reset()
	}
	expect(totalRewards.slice(-5).reduce((s, v) => s + v, 0) / 5).toBeGreaterThan(-30)
	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
