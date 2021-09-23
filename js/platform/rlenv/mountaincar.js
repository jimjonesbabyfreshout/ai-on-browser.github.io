import MountainCarRLEnvironment from '../../../lib/rl/mountaincar.js'

export default class MountainCarRenderer extends MountainCarRLEnvironment {
	constructor(platform) {
		super()
		this.platform = platform

		this._cart_size = [50, 30]
		this._scale = 300
		this._upon = 10
	}

	init(r) {
		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		const width = this.platform.width

		const p = []
		const dx = (this._max_position - this._min_position) / 100
		const offx = ((this._max_position + this._min_position) * this._scale - width) / 2
		for (let i = 0; i < 100; i++) {
			const x = this._min_position + dx * i
			p.push([x * this._scale - offx, this._height(x) * this._scale])
		}
		p.push([this._max_position * this._scale - offx, this._height(this._max_position) * this._scale])
		r.append('path').attr('stroke', 'black').attr('fill-opacity', 0).attr('d', line(p))

		r.append('rect')
			.attr('width', this._cart_size[0])
			.attr('height', this._cart_size[1])
			.attr('fill', 'gray')
			.style('transform-box', 'fill-box')
			.style('transform-origin', 'center')
	}

	_height(x) {
		return Math.sin(3 * x) * 0.45 + 0.55
	}

	render(r) {
		const width = this.platform.width

		const offx = ((this._max_position + this._min_position) * this._scale - width) / 2

		const t = Math.atan(-0.45 * 3 * Math.cos(3 * this._position))
		r.select('rect')
			.attr('x', this._position * this._scale - offx - this._cart_size[0] / 2 + Math.sin(t) * this._upon)
			.attr('y', this._height(this._position) * this._scale + Math.cos(t) * this._upon)
			.style('transform', `rotate(${(-t * 360) / (2 * Math.PI) + 180}deg)`)
	}
}