import { RLEnvironmentBase } from '../../../lib/rl/base.js'
import { Game } from '../game/base.js'

const EMPTY = 1
const BLACK = 2
const WHITE = 3

const flipPiece = p => {
	if (p === BLACK) {
		return WHITE
	} else if (p === WHITE) {
		return BLACK
	}
	return EMPTY
}

export default class ReversiRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super()
		this._platform = platform

		this._size = [8, 8]

		this._game = new Reversi(this)
		this._board = this._game.board

		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
		this._org_width = this._platform.width
		this._org_height = this._platform.height
	}

	get actions() {
		const a = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				a.push(`${i}_${j}`)
			}
		}
		return [a];
	}

	get states() {
		const s = []
		for (let i = 0; i < this._size[0] * this._size[1]; i++) {
			s.push([EMPTY, BLACK, WHITE])
		}
		return s
	}

	set reward(value) {
	}

	init(r) {
		this._platform.width = 500
		this._platform.height = 500
		const width = this._platform.width;
		const height = this._platform.height;

		const dw = width / this._size[1]
		const dh = height / this._size[0]
		this._cells = []
		for (let i = 0; i < this._size[0]; i++) {
			this._cells[i] = []
			for (let j = 0; j < this._size[1]; j++) {
				this._cells[i][j] = r.append("g")
				this._cells[i][j].append("rect")
					.attr("x", j * dw)
					.attr("y", i * dh)
					.attr("width", dw)
					.attr("height", dh)
					.attr("fill", "#339933")
					.attr("stroke", "#333333")
					.attr("stroke-width", "1")
			}
		}
	}

	reset() {
		super.reset()
		this._board.reset()

		return this.state();
	}

	render(r) {
		for (let i = 0; i < this._cells.length; i++) {
			for (let j = 0; j < this._cells[i].length; j++) {
				this._cells[i][j].selectAll("circle").remove()
				if (this._board.at([i, j]) === EMPTY) {
					continue
				}
				const cell = this._cells[i][j].select("rect")
				const x = +cell.attr("x")
				const y = +cell.attr("y")
				const width = +cell.attr("width")
				const height = +cell.attr("height")
				const circle = this._cells[i][j].append("circle")
						.attr("cx", x + width / 2)
						.attr("cy", y + height / 2)
						.attr("r", Math.min(width, height) * 0.4)
						.attr("stroke", "black")
						.attr("stroke-width", "1")
				if (this._board.at([i, j]) === WHITE) {
					circle.attr("fill", "white")
				} else if (this._board.at([i, j]) === BLACK) {
					circle.attr("fill", "black")
				}
			}
		}
	}

	state(agent) {
		const s = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				s.push(this._board.at([i, j]))
			}
		}
		return s
	}

	step(action, agent) {
		super.step(action, agent)
		const info = this.test(this.state, action, agent);
		return info;
	}

	test(state, action, agent) {
		return {
			state: [],
			reward: 0,
			done: false
		}
	}

	evaluation(func) {
		this._evaluation = func
	}

	game(...players) {
		if (!players[0]) {
			players[0] = new ManualPlayer(this)
		}
		if (!players[1]) {
			players[1] = new ManualPlayer(this)
		}
		players[0].turn = BLACK
		players[1].turn = WHITE
		this._game.players = players
		return this._game
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}

class Reversi extends Game {
	constructor(env) {
		super(env)
		this._board = new ReversiBoard(env._size, env._evaluation)
		this.turns = [BLACK, WHITE]
	}

	_showResult(r) {
		const count = this._board.count
		r.append("tspan")
			.attr("x", "0em")
			.attr("y", "-1em")
			.text(`BLACK: ${count.black}`)
		r.append("tspan")
			.attr("x", "0em")
			.attr("y", "1em")
			.text(`WHITE: ${count.white}`)
	}
}

class ReversiBoard {
	constructor(size, evaluator) {
		this._evaluator = evaluator
		this._size = size

		this.reset()
	}

	get size() {
		return this._size
	}

	get count() {
		let b = 0
		let w = 0
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this._board[i][j] === WHITE) {
					w++
				} else if (this._board[i][j] === BLACK) {
					b++
				}
			}
		}
		return {
			black: b,
			white: w
		}
	}

	get finish() {
		return this.choices(BLACK).length + this.choices(WHITE).length === 0
	}

	get winner() {
		if (!this.finish) {
			return null
		}
		const count = this.count
		if (count.black > count.white) {
			return BLACK
		} else if (count.black < count.white) {
			return WHITE
		}
		return null
	}

	nextTurn(turn) {
		return flipPiece(turn)
	}

	copy() {
		const cp = new ReversiBoard(this._size, this._evaluator)
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				cp._board[i][j] = this._board[i][j]
			}
		}
		return cp
	}

	score(turn) {
		if (this._evaluator) {
			return this._evaluator(this, turn)
		}
		const count = this.count
		if (turn === BLACK) {
			return count.black - count.white
		} else {
			return count.white - count.black
		}
	}

	at(p) {
		return this._board[p[0]][p[1]]
	}

	set(p, turn) {
		const flips = this.flipPositions(p[0], p[1], turn)
		if (flips.length === 0) {
			return false
		}
		this._board[p[0]][p[1]] = turn
		for (const [ti, tj] of flips) {
			this._board[ti][tj] = turn
		}
		return true
	}

	reset() {
		this._board = []
		for (let i = 0; i < this._size[0]; i++) {
			this._board[i] = Array(this._size[1]).fill(EMPTY)
		}
		const cx = Math.floor(this._size[0] / 2)
		const cy = Math.floor(this._size[1] / 2)
		this._board[cx - 1][cy - 1] = BLACK
		this._board[cx - 1][cy] = WHITE
		this._board[cx][cy - 1] = WHITE
		this._board[cx][cy] = BLACK
	}

	choices(turn) {
		const c = []
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (this.flipPositions(i, j, turn).length > 0) {
					c.push([i, j])
				}
			}
		}
		return c
	}

	flipPositions(i, j, turn) {
		if (i < 0 || j < 0 || this._size[0] <= i || this._size[1] <= j) {
			return []
		} else if (turn === EMPTY || this._board[i][j] !== EMPTY) {
			return []
		}
		const p = []
		for (const [di, dj] of [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]]) {
			let ti = i
			let tj = j
			const tmp = []
			while (true) {
				ti += di
				tj += dj
				if (ti < 0 || tj < 0 || this._size[0] <= ti || this._size[1] <= tj) {
					break
				} else if (this._board[ti][tj] === turn) {
					p.push(...tmp)
					break
				} else if (this._board[ti][tj] === EMPTY) {
					break
				}
				tmp.push([ti, tj])
			}
		}
		return p
	}
}

class ManualPlayer {
	constructor(env) {
		this._turn = null
		this._env = env

		this._obj = null
	}

	set turn(value) {
		this._turn = value
	}

	action(board, cb) {
		const width = this._env.platform.width
		const height = this._env.platform.height
		const _this = this
		this._obj = this._env.svg.append("g")
		const choices = board.choices(this._turn)
		this._obj.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("opacity", 0)
			.on("click", function() {
				const pos = d3.mouse(this)
				const cell = [Math.floor(pos[1] / width * board.size[0]), Math.floor(pos[0] / height * board.size[1])]
				cb(cell)
				_this._obj.remove()
				_this._obj = null
			})
	}

	close() {
		if (this._obj) {
			this._obj.remove()
		}
	}
}
