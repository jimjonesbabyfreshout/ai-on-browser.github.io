import { QTableBase } from './q_learning.js'

class SoftmaxPolicyGradient {
	// https://book.mynavi.jp/manatee/detail/id=88297
	// https://qiita.com/shionhonda/items/ec05aade07b5bea78081
	constructor(env, resolution = 20) {
		this._params = new QTableBase(env, resolution)
		this._epoch = 0
	}

	get _state_sizes() {
		return this._params._state_sizes
	}

	get _action_sizes() {
		return this._params._action_sizes
	}

	_state_index(state) {
		return this._params._state_index(state)
	}

	_action_index(action) {
		return this._params._action_index(action)
	}

	probability(state) {
		state = this._params._state_index(state)
		const [p] = this._params._q(state)
		const expp = p.map(Math.exp)
		const s = expp.reduce((a, v) => a + v, 0)
		const pi = expp.map(v => v / s)
		return pi
	}

	toArray() {
		return this._params.toArray()
	}

	get_action(state) {
		const pi = this.probability(state)
		const r = Math.random()
		let cumu = 0
		let k = -1
		for (let i = 0; i < pi.length; i++) {
			cumu += pi[i]
			if (r < cumu) {
				k = i
				break
			}
		}
		return this._params._action_value(this._params._to_index(this._action_sizes, k))
	}

	update(actions, learning_rate) {
		const n = actions.length
		const stateCount = []
		const actionCount = {}
		for (const action of actions) {
			let [act, state, reward] = action
			state = this._state_index(state)
			act = this._action_index(act)
			const si = this._params._to_position(this._state_sizes, state)[0]
			stateCount[si] = (stateCount[si] || 0) + 1

			const [_, i] = this._params._q(state, act)
			if (!actionCount[i]) {
				const prob = this.probability(state)
				const aidx = this._params._to_position(this._action_sizes, act)[0]
				actionCount[i] = {
					n: 0,
					s: si,
					p: prob[aidx],
				}
			}
			actionCount[i].n++
		}
		for (const i of Object.keys(actionCount)) {
			const a = actionCount[i]
			this._params._table[i] += (learning_rate * (a.n + a.p * stateCount[a.s])) / n
		}
		this._epoch++
	}
}

export default class PGAgent {
	constructor(env, resolution = 20) {
		this._table = new SoftmaxPolicyGradient(env, resolution)
	}

	get_score(env) {
		return this._table.toArray()
	}

	get_action(env, state) {
		return this._table.get_action(state)
	}

	update(actions, learning_rate) {
		this._table.update(actions, learning_rate)
	}
}