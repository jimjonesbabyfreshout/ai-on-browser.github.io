export class HoltWinters {
	// https://takuti.me/ja/note/holt-winters/
	constructor(a, b = 0, g = 0, s = 0) {
		this._a = a
		this._b = b
		this._g = g
		this._s = s
	}

	fit(x) {
		const f = [x[0]]
		this._d = x[0].length
		this._level = x[0].concat()
		this._trend = Array(this._d).fill(0)
		this._season = []
		for (let i = 0; i < this._s; i++) {
			this._season[i] = Array(this._d).fill(0)
		}

		for (let i = 1; i < x.length; i++) {
			const ft = []
			for (let j = 0; j < this._d; j++) {
				const level =
					this._a * (this._s <= 0 ? x[i][j] : x[i][j] - this._season[i % this._s][j]) +
					(1 - this._a) * (this._level[j] + this._trend[j])
				this._trend[j] = this._b * (level - this._level[j]) + (1 - this._b) * this._trend[j]
				ft[j] = level + this._trend[j]
				this._level[j] = level
				if (this._s > 0) {
					this._season[i % this._s][j] =
						this._g * (x[i][j] - level) + (1 - this._g) * this._season[i % this._s][j]
				}
			}
			f.push(ft)
		}
		this._step_offset = x.length + 1
		return f
	}

	predict(k) {
		const pred = []
		let x = this._level.map((l, i) => l + this._trend[i])
		let ll = this._level.concat()
		let trend = this._trend.concat()
		for (let i = 0; i < k; i++) {
			const p = []
			for (let j = 0; j < this._d; j++) {
				const level =
					this._a * (this._s <= 0 ? x[j] : x[j] - this._season[(i + this._step_offset) % this._s][j]) +
					(1 - this._a) * x[j]
				trend[j] = this._b * (ll[j] - level) + (1 - this._b) * trend[j]
				p[j] = level + trend[j]
				ll[j] = level
				x[j] = level + trend[j]
			}
			pred.push(p)
		}
		return pred
	}
}