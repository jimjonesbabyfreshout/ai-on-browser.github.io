import { Matrix } from '../util/math.js'

export default class PA {
	// https://www.slideshare.net/hirsoshnakagawa3/ss-32274089
	constructor(v = 0) {
		this._c = 0.1
		this._v = v
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._m = this._x.mean(0)
		this._x.sub(this._m)
		this._y = train_y

		this._d = this._x.cols
		this._w = Matrix.zeros(this._d, 1)
	}

	update(x, y) {
		const m = x.dot(this._w).value[0]
		if (y * m >= 1) return
		const l = Math.max(0, 1 - y * m)
		const n = x.norm() ** 2
		let t = 0
		if (this._v === 0) {
			t = l / n
		} else if (this._v === 1) {
			t = Math.min(this._c, l / n)
		} else if (this._v === 2) {
			t = l / (n + 1 / (2 * this._c))
		}
		const xt = x.t
		xt.mult(t * y)
		this._w.add(xt)
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i), this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._m)
		const r = x.dot(this._w)
		return r.value
	}
}