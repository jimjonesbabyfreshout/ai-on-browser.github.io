import { RLRealRange, RLEnvironmentBase } from './base.js'

export default class WaterballRLEnvironment extends RLEnvironmentBase {
	// https://cs.stanford.edu/people/karpathy/reinforcejs/waterworld.html
	constructor(platform) {
		super(platform)

		this._agent_p = [this.platform.width / 2, this.platform.height / 2]
		this._agent_v = [0, 0]

		this._balls = []
		this._ball_min_velocity = 0.1
		this._ball_max_velocity = 0.5
		this._ball_radius = 10
		this._sensor_length = 80
		this._sensor_count = 20

		this._agent_radius = 10
		this._agent_max_velocity = 1
		this._agent_velocity_step = 0.1
		this._min_position = [0, 0]
		this._max_position = [this.platform.width, this.platform.height]

		this._max_size = 30

		this._history_state_size = 1
		this._history_state = []

		let dt = 2 * Math.PI / this._sensor_count
		this._sin = []
		this._cos = []
		for (let i = 0; i < this._sensor_count; i++) {
			this._sin[i] = this._sensor_length * Math.sin(dt * i)
			this._cos[i] = this._sensor_length * Math.cos(dt * i)
		}

		this._init_menu()
	}

	get actions() {
		return [[0, 1, 2, 3]];
	}

	get states() {
		if (this.__states) {
			return this.__states
		}
		const states = this.__states = [
			new RLRealRange(-this._agent_max_velocity, this._agent_max_velocity),
			new RLRealRange(-this._agent_max_velocity, this._agent_max_velocity),
		]
		for (let k = 0; k < this._history_state_size; k++) {
			for (let i = 0; i < this._sensor_count; i++) {
				states.push(
					new RLRealRange(0, this._sensor_length),
					["none", "wall", "apple", "poison"],
					new RLRealRange(-this._ball_max_velocity, this._ball_max_velocity),
					new RLRealRange(-this._ball_max_velocity, this._ball_max_velocity),
				)
			}
		}
		return states
	}

	get current_state() {
		const state = [];
		state.push(...this._agent_v)
		const c = this._agent_p
		const near_balls = this._balls.filter(ball => {
			const d = Math.sqrt(ball.c.reduce((s, v, i) => s + (v - c[i]) ** 2, 0))
			return d <= this._sensor_length + this._ball_radius
		})
		for (let i = 0; i < this._sensor_count; i++) {
			const p = [c[0] + this._cos[i], c[1] + this._sin[i]]
			const cp = [p[0] - c[0], p[1] - c[1]]
			const norm_cp = Math.sqrt(cp[0] ** 2 + cp[1] ** 2)
			const cp1 = [cp[0] / norm_cp, cp[1] / norm_cp]
			let min_d = Infinity
			let min_ball = null
			for (let i = 0; i < 2; i++) {
				if (p[i] < this._min_position[i] || this._max_position[i] < p[i]) {
					const t_pos = p[i] < this._min_position[i] ? this._min_position[i] : this._max_position[i]
					min_d = Math.min(min_d, this._sensor_length * (c[i] - t_pos) / (c[i] - p[i]))
					min_ball = {
						type: "wall",
						v: [0, 0]
					}
				}
			}
			for (let k = 0; k < near_balls.length; k++) {
				const ball = near_balls[k]
				const b = ball.c
				const cb = [b[0] - c[0], b[1] - c[1]]
				const cb_d = Math.sqrt(cb[0] ** 2 + cb[1] ** 2)
				const pb = [b[0] - p[0], b[1] - p[1]]

				const d = cp1[0] * cb[1] - cb[0] * cp1[1]
				if (Math.abs(d) > this._ball_radius) {
					continue
				}

				const cm = cp[0] * cb[0] + cp[1] * cb[1]
				const pm = cp[0] * pb[0] + cp[1] * pb[1]
				if (cm * pm > 0) {
					const pb_d = Math.sqrt(pb[0] ** 2 + pb[1] ** 2)
					if (cb_d > this._ball_radius && pb_d > this._ball_radius) {
						continue
					}
				}

				let cx
				if (cp[0] === 0) {
					cx = [cp[0], cb[1]]
				} else if (cp[1] === 0) {
					cx = [cb[0], cp[1]]
				} else {
					const m1 = cp[1] / cp[0]
					const b1 = cp[1] - m1 * cp[0]
					const m2 = -1 / m1
					const b2 = cb[1] - m2 * cb[0]
					cx = [(b2 - b1) / (m1 - m2), (b2 * m1 - b1 * m2) / (m1 - m2)]
				}

				const hx_d = Math.sqrt(this._ball_radius ** 2 - d ** 2)
				const ch = [cx[0] - cp1[0] * hx_d, cx[1] - cp1[1] * hx_d]
				const ch_d = Math.sqrt(ch[0] ** 2 + ch[1] ** 2)
				if (ch_d < min_d) {
					min_d  = ch_d
					min_ball = ball
				}
			}
			state.push(
				(min_d < Infinity) ? min_d : this._sensor_length,
				min_ball ? min_ball.type : "none",
				min_ball ? min_ball.v[0] : 0,
				min_ball ? min_ball.v[1] : 0
			)
		}
		return state
	}

	_init_menu() {
		const r = this.setting.rl.configElement
		r.selectAll("*").remove()
		r.append("span").text("Number of balls ")
		r.append("input")
			.attr("type", "number")
			.attr("name", "max_size")
			.attr("min", 1)
			.attr("max", 100)
			.attr("value", this._max_size)
			.on("change", () => {
				this._max_size = +r.select("[name=max_size]").property("value")
			})
	}

	addBall(r) {
		const random_position = (d) => {
			return Math.random() * (this._max_position[d] - this._min_position[d]) + this._min_position[d]
		}
		const random_velocity = () => {
			const v = Math.random() * (this._ball_max_velocity - this._ball_min_velocity) + this._ball_min_velocity
			return v * (Math.random() < 0.5 ? -1 : 1)
		}
		const type = Math.random() < 0.5 ? "apple" : "poison"
		const c = [random_position(0), random_position(1)]
		const elm = r.append("circle")
			.attr("cx", c[0])
			.attr("cy", c[1])
			.attr("r", this._ball_radius)
			.attr("fill", type === "apple" ? d3.rgb(255, 96, 96) : d3.rgb(96, 255, 96))
			.attr("stroke", "gray")
			.attr("stroke-width", 1)
		const ball = {
			type: type,
			c: c,
			v: [random_velocity(), random_velocity()],
			elm: elm,
			render() {
				elm.attr("cx", ball.c[0])
					.attr("cy", ball.c[1])
			},
			update: () => {
				for (let i = 0; i < 2; i++) {
					ball.c[i] += ball.v[i]
					if (ball.c[i] <= this._min_position[i] || this._max_position[i] <= ball.c[i]) {
						ball.v[i] *= -1
					}
				}
			},
			remove() {
				elm.remove()
			}
		}
		this._balls.push(ball)
	}

	init(r) {
		for (let i = 0; i < this._max_size; i++) {
			this.addBall(r);
		}
		const g = r.append("g")
			.classed("agent", true)
			.attr("transform", `translate(${this._agent_p.join(',')})`)
		let dt = 360 / this._sensor_count
		for (let i = 0; i < this._sensor_count; i++) {
			g.append("line")
				.classed(`sensor_${i}`, true)
				.attr("x1", 0)
				.attr("x2", this._sensor_length)
				.attr("y1", 0)
				.attr("y2", 0)
				.attr("stroke", "black")
				.attr("stroke-width", 1)
				.attr("transform", `rotate(${dt * i})`)
		}
		g.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("fill", d3.rgb(128, 128, 128))
			.attr("stroke-width", 0)
			.attr("r", this._agent_radius)
	}

	reset() {
		return this.state();
	}

	render(r) {
		this._balls.forEach(b => b.render())
		r.select(".agent")
			.attr("transform", `translate(${this._agent_p.join(',')})`)
		const state = this.state()
		for (let i = 0; i < this._sensor_count; i++) {
			const l = state[2 + i * 4];
			const type = state[2 + i * 4 + 1]
			r.select(`.sensor_${i}`)
				.attr("x2", l)
				.attr("stroke", type === "apple" ? d3.rgb(255, 160, 160) :
					type === "poison" ? d3.rgb(160, 255, 160) : "black")
		}
	}

	state() {
		if (this.__state) {
			return this.__state
		}
		const cur_state = this.current_state
		this._history_state.push(this.current_state)
		if (this._history_state.length > this._history_state_size) {
			this._history_state.shift()
		}
		while (this._history_state.length < this._history_state_size) {
			this._history_state.push(cur_state)
		}

		this.__state = this._history_state[0].concat()
		for (let i = 1; i < this._history_state.length; i++) {
			this.__state.push(...this._history_state[i].slice(2))
		}
		return this.__state
	}

	step(action, agent) {
		this.__state = null
		this._balls.forEach(b => b.update())
		if (action[0] === 0) {
			this._agent_v[0] += this._agent_velocity_step
		} else if (action[0] === 1) {
			this._agent_v[0] -= this._agent_velocity_step
		} else if (action[0] === 2) {
			this._agent_v[1] += this._agent_velocity_step
		} else if (action[0] === 3) {
			this._agent_v[1] -= this._agent_velocity_step
		}
		for (let i = 0; i < 2; i++) {
			if (this._agent_v[i] > this._agent_max_velocity) {
				this._agent_v[i] = this._agent_max_velocity
			}
			if (this._agent_v[i] < -this._agent_max_velocity) {
				this._agent_v[i] = -this._agent_max_velocity
			}
		}

		this._agent_p[0] += this._agent_v[0]
		this._agent_p[1] += this._agent_v[1]

		let reward = -0.01
		for (let i = this._balls.length - 1; i >= 0; i--) {
			const ball = this._balls[i]
			const b = ball.c
			const d = Math.sqrt(this._agent_p.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
			if (d <= this._agent_radius + this._ball_radius) {
				ball.remove()
				if (ball.type === "apple") {
					reward += 1
				} else {
					reward -= 1
				}
				this._balls.splice(i, 1)
			}
		}

		for (let i = 0; i < 2; i++) {
			if (this._agent_p[i] < this._min_position[i]) {
				this._agent_p[i] = this._min_position[i]
				reward -= 1
			} else if (this._agent_p[i] > this._max_position[i]) {
				this._agent_p[i] = this._max_position[i]
				reward -= 1
			}
		}

		if (this._balls.length < this._max_size && Math.random() < 0.01) {
			this.addBall(this.platform._r);
		}

		return {
			state: this.state(),
			reward,
			done: false
		}
	}
}

