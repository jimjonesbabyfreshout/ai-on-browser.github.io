import BreakerRLEnvironment from '../../../lib/rl/breaker.js'

export default class BreakerRenderer extends BreakerRLEnvironment {
	constructor(platform) {
		super()
		this._platform = platform
		this._width = this._platform.width
		this._height = this._platform.height

		this._org_width = this._platform.width
		this._org_height = this._platform.height

		this._render_blocks = []
	}

	init(r) {
		this._platform.width = this._size[0]
		this._platform.height = this._size[1]

		this._render_blocks = []
		for (let i = 0; i < this._block_positions.length; i++) {
			this._render_blocks[i] = r
				.append('rect')
				.attr('x', this._block_positions[i][0] - this._block_size[0] / 2)
				.attr('y', this._block_positions[i][1] - this._block_size[1] / 2)
				.attr('width', this._block_size[0])
				.attr('height', this._block_size[1])
				.attr(
					'fill',
					d3.rgb(
						Math.floor(Math.random() * 128),
						Math.floor(Math.random() * 128),
						Math.floor(Math.random() * 128)
					)
				)
		}
		this._render_ball = r
			.append('circle')
			.attr('cx', this._ball_position[0])
			.attr('cy', this._ball_position[1])
			.attr('r', this._ball_radius)
			.attr('fill', 'black')
		this._render_paddle = r
			.append('rect')
			.attr('x', this._paddle_position - this._paddle_size[0] / 2)
			.attr('y', this._paddle_baseline - this._paddle_size[1] / 2)
			.attr('width', this._paddle_size[0])
			.attr('height', this._paddle_size[1])
			.attr('fill', 'black')
	}

	render(r) {
		for (let i = 0; i < this._block_positions.length; i++) {
			if (!this._block_existances[i]) {
				this._render_blocks[i].style('display', 'none')
			} else {
				this._render_blocks[i].style('display', null)
			}
		}
		this._render_ball.attr('cx', this._ball_position[0]).attr('cy', this._ball_position[1])
		this._render_paddle.attr('x', this._paddle_position - this._paddle_size[0] / 2)
	}

	close() {
		this._platform.width = this._org_width
		this._platform.height = this._org_height
	}
}