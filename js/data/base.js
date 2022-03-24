export class BaseData {
	constructor(manager) {
		this._x = []
		this._y = []
		this._index = null
		this._manager = manager
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._manager.setting.svg
	}

	get availTask() {
		return []
	}

	get dimension() {
		return this.domain.length
	}

	get domain() {
		if (this.length === 0) {
			return []
		}
		const domain = []
		for (let i = 0; i < this.x[0].length; i++) {
			domain.push([Infinity, -Infinity])
		}
		for (const x of this.x) {
			if (Array.isArray(x[0])) {
				continue
			}
			for (let d = 0; d < x.length; d++) {
				domain[d][0] = Math.min(domain[d][0], x[d])
				domain[d][1] = Math.max(domain[d][1], x[d])
			}
		}
		return domain
	}

	get range() {
		const range = [Infinity, -Infinity]
		for (const y of this.y) {
			range[0] = Math.min(range[0], y)
			range[1] = Math.max(range[1], y)
		}
		return range
	}

	get indexRange() {
		const index = this.index
		const range = [Infinity, -Infinity]
		if (!index) {
			return range
		}
		for (const idx of index) {
			range[0] = Math.min(range[0], idx)
			range[1] = Math.max(range[1], idx)
		}
		return range
	}

	get categories() {
		return [...new Set(this.y)]
	}

	get length() {
		return this.x.length || this.y.length || this.index?.length || 0
	}

	get columnNames() {
		const names = []
		for (let i = 0; i < this.dimension; i++) {
			names[i] = `${i}`
		}
		return names
	}

	get x() {
		return this._x
	}

	get y() {
		return this._y
	}

	get index() {
		return this._index
	}

	get points() {
		return this._manager.platform._renderer.points
	}

	get scale() {
		return 1
	}

	set scale(s) {}

	get params() {
		return {}
	}

	set params(params) {}

	*[Symbol.iterator]() {
		const l = this.length
		for (let i = 0; i < l; i++) {
			yield this.at(i)
		}
	}

	splice(start, count, ...items) {
		return []
	}

	set(i, x, y) {
		this.splice(i, 1, x, y)
	}

	push(...items) {
		this.splice(this.length, 0, ...items)
	}

	pop() {
		return this.splice(this.length - 1, 1)[0]
	}

	unshift(...items) {
		this.splice(0, 0, ...items)
	}

	shift() {
		return this.splice(0, 1)[0]
	}

	slice(start, end) {
		const r = []
		for (let i = start; i < end; i++) {
			r.push(this.at(i))
		}
		return r
	}

	forEach(cb) {
		const l = this.length
		for (let i = 0; i < l; i++) {
			cb(this.at(i), i, this)
		}
	}

	map(cb) {
		const l = this.length
		const r = []
		for (let i = 0; i < l; i++) {
			r.push(cb(this.at(i), i, this))
		}
		return r
	}

	swap(i, j) {
		;[this._x[i], this._x[j]] = [this._x[j], this._x[i]]
		;[this._y[i], this._y[j]] = [this._y[j], this._y[i]]
	}

	sort(cb) {
		const l = this.length
		const v = []
		for (let i = 0; i < l; i++) {
			v[i] = this.at(i)
			for (let j = i; j > 0; j--) {
				if (cb(v[j - 1], v[j]) > 0) {
					this.swap(j - 1, j)
				}
			}
		}
	}

	remove() {
		this.splice(0, this.length)
	}

	terminate() {
		this.setting.data.configElement.selectAll('*').remove()
		this.remove()
	}
}

export class MultiDimensionalData extends BaseData {
	constructor(manager) {
		super(manager)

		this._categorical_output = false
		this._input_category_names = []
		this._output_category_names = null
	}

	get columnNames() {
		return this._feature_names || []
	}

	get inputCategoryNames() {
		return this._input_category_names
	}

	get originalX() {
		const x = []
		for (let i = 0; i < this._x.length; i++) {
			x[i] = []
			for (let j = 0; j < this._x[i].length; j++) {
				x[i][j] = this._input_category_names[j] ? this._input_category_names[j][this._x[i][j]] : this._x[i][j]
			}
		}
		return x
	}

	get outputCategoryNames() {
		return this._output_category_names
	}

	get originalY() {
		return this._categorical_output ? this._originalY : this._y
	}

	setArray(data, infos) {
		this._categorical_output = false
		this._input_category_names = []
		this._output_category_names = null
		this._originalY = undefined

		this._x = []
		for (let i = 0; i < data.length; i++) {
			this._x[i] = []
		}
		this._y = []

		for (let i = 0, k = 0; i < infos.length; i++) {
			if (infos[i].ignore) {
				continue
			}
			if (!infos[i].type) {
				infos[i].type = data.every(d => !isNaN(d[i])) ? 'numeric' : 'category'
			}
			if (infos[i].out) {
				this._categorical_output = infos[i].type === 'category'
				this._y = data.map(d => (isNaN(d[i]) ? d[i] : +d[i]))

				if (this._categorical_output) {
					this._output_category_names = [...new Set(this._y)]
					this._originalY = this._y
					this._y = this._y.map(v => this._output_category_names.indexOf(v) + 1)
					if (infos[i].labels) {
						this._output_category_names[k] = this._output_category_names[k].map(v =>
							infos[i].labels.hasOwnProperty(v) ? infos[i].labels[v] : v
						)
					}
				}
			} else {
				if (infos[i].type === 'category') {
					this._input_category_names[k] = [...new Set(data.map(d => d[i]))]
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(this._input_category_names[k].indexOf(data[j][i]))
					}
					if (infos[i].labels) {
						this._input_category_names[k] = this._input_category_names[k].map(v =>
							infos[i].labels.hasOwnProperty(v) ? infos[i].labels[v] : v
						)
					}
				} else {
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(isNaN(data[j][i]) ? data[j][i] : +data[j][i])
					}
				}
				k++
			}
		}

		this._feature_names = infos.filter(v => !v.out && !v.ignore).map(v => v.name)
		this._domain = null
		this._manager.onReady(() => {
			this._manager.platform.init()
		})
	}
}

export class FixData extends MultiDimensionalData {
	constructor(manager) {
		super(manager)
		this._domain = null
	}

	get domain() {
		if (this._domain) {
			return this._domain
		}

		return (this._domain = super.domain)
	}

	at(i) {
		return Object.defineProperties(
			{},
			{
				x: {
					get: () => this._x[i],
				},
				y: {
					get: () => this._y[i],
				},
				point: {
					get: () => this.points[i],
				},
			}
		)
	}
}
