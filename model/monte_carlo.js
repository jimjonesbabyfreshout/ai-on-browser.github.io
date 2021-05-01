import { QTableBase } from './q_learning.js'

class MCTable extends QTableBase{
	constructor(env, resolution = 20, gamma = 0.99) {
		super(env, resolution);
		this._g = Array(this._table.length).fill(0);
		this._epoch = 0;
		this._gamma = gamma;
	}

	update(actions) {
		let last_g = 0
		for (let i = actions.length - 1; i >= 0; i--) {
			const [action, cur_state, reward] = actions[i];
			const [_, gs] = this._q(this._state_index(cur_state), this._action_index(action))
			last_g = reward + this._gamma * last_g;
			this._g[gs] = (last_g + this._g[gs] * this._epoch) / (this._epoch + 1);
			this._table[gs] = this._g[gs];
		}
		this._epoch++;
	}
}

class MCAgent {
	constructor(env, resolution = 20) {
		this._table = new MCTable(env, resolution);
	}

	get_score(env) {
		return this._table.toArray();
	}

	get_action(env, state, greedy_rate = 0.5) {
		if (Math.random() > greedy_rate) {
			return this._table.best_action(state);
		} else {
			return env.sample_action(this);
		}
	}

	update(actions) {
		this._table.update(actions);
	}
}

var dispMC = function(elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20;

	let agent = new MCAgent(env, initResolution);
	let cur_state = env.reset(agent);
	env.render(() => agent.get_score(env))

	let action_history = [];

	const step = (render = true) => {
		const greedy_rate = +elm.select("[name=greedy_rate]").property("value")
		const action = agent.get_action(env, cur_state, greedy_rate);
		const [next_state, reward, done] = env.step(action, agent);
		action_history.push([action, cur_state, reward]);
		if (render) {
			env.render()
		}
		cur_state = next_state;
		if (done) {
			agent.update(action_history)
			action_history = [];
		}
		return done;
	}

	const reset = () => {
		cur_state = env.reset(agent);
		action_history = [];
		env.render(() => agent.get_score(env))
	}

	elm.append("span")
		.text("Resolution")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "resolution")
		.attr("min", 2)
		.attr("max", 100)
		.attr("value", initResolution)
	const slbConf = env.setting.ml.controller.stepLoopButtons().init(() => {
		const resolution = +elm.select("[name=resolution]").property("value")
		agent = new MCAgent(env, resolution);
		reset();
	})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Reset")
		.on("click", reset);
	elm.append("input")
		.attr("type", "number")
		.attr("name", "greedy_rate")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", "0.01")
		.attr("value", 0.5)
	slbConf.step(cb => {
		if (step()) {
			setTimeout(() => {
				reset();
				cb && setTimeout(cb, 10);
			})
		} else {
			cb && setTimeout(cb, 5);
		}
	}).skip(() => {
		if (step(false)) {
			reset()
		}
	})
	env.plotRewards(elm)

	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Data point becomes wall. Click "step" to update.'
	platform.setting.ternimate = dispMC(platform.setting.ml.configElement, platform)
}
