import { Matrix } from '../js/math.js'

export class GMM {
	// see https://www.slideshare.net/TakayukiYagi1/em-66114496
	// Anomaly detection https://towardsdatascience.com/understanding-anomaly-detection-in-python-using-gaussian-mixture-model-e26e5d06094b
	//                   A Survey of Outlier Detection Methodologies. (2004)
	constructor() {
		this._k = 0
		this._d = null
		this._p = []
		this._m = []
		this._s = []
	}

	_init(datas) {
		if (!this._d) {
			this._d = datas[0].length
			for (let i = 0; i < this._k; i++) {
				this.add()
				this._k--
			}
		}
	}

	add() {
		this._k++
		if (this._d) {
			this._p.push(Math.random())
			this._m.push(Matrix.random(this._d, 1))
			const s = Matrix.randn(this._d, this._d)
			this._s.push(s.tDot(s))
		}
	}

	clear() {
		this._k = 0
		this._p = []
		this._m = []
		this._s = []
	}

	probability(data) {
		this._init(data)
		return data.map(v => {
			const x = new Matrix(this._d, 1, v)
			const prob = []
			for (let i = 0; i < this._k; i++) {
				const v = this._gaussian(x, this._m[i], this._s[i]) * this._p[i]
				prob.push(v)
			}
			return prob
		})
	}

	predict(data) {
		this._init(data)
		return data.map(v => {
			const x = new Matrix(this._d, 1, v)
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._k; i++) {
				let v = this._gaussian(x, this._m[i], this._s[i])
				if (v > max_p) {
					max_p = v
					max_c = i
				}
			}
			return max_c
		})
	}

	_gaussian(x, m, s) {
		const xs = x.copySub(m)
		return (
			Math.exp(-0.5 * xs.tDot(s.inv()).dot(xs).value[0]) /
			(Math.sqrt(2 * Math.PI) ** this._d * Math.sqrt(s.det()))
		)
	}

	fit(datas) {
		this._init(datas)
		const n = datas.length
		const g = []
		const N = Array(this._k).fill(0)
		const x = []
		datas.forEach((data, i) => {
			const ns = []
			let s = 0
			const xi = new Matrix(this._d, 1, data)
			for (let j = 0; j < this._k; j++) {
				const v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j]
				ns.push(v || 0)
				s += v || 0
			}
			const gi = ns.map(v => v / (s || 1.0))
			g.push(gi)
			x.push(xi)
			gi.forEach((v, j) => (N[j] += v))
		})

		for (let i = 0; i < this._k; i++) {
			const new_mi = new Matrix(this._d, 1)
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]))
			}
			new_mi.div(N[i])
			this._m[i] = new_mi

			const new_si = new Matrix(this._d, this._d)
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi)
				tt = tt.dot(tt.t)
				tt.mult(g[j][i])
				new_si.add(tt)
			}
			new_si.div(N[i])
			new_si.add(Matrix.eye(this._d, this._d, 1.0e-8))
			this._s[i] = new_si

			this._p[i] = N[i] / n
		}
	}
}

export class SemiSupervisedGMM extends GMM {
	// http://yamaguchiyuto.hatenablog.com/entry/machine-learning-advent-calendar-2014
	constructor() {
		super()
	}

	init(datas, labels) {
		this.clear()
		this._init(datas)
		const classes = [...new Set(labels.filter(v => v > 0))]
		for (let k = 0; k < classes.length; k++) {
			super.add()
		}
	}

	add() {}

	fit(datas, y) {
		this._init(datas)
		const n = datas.length
		const g = []
		const N = Array(this._k).fill(0)
		const x = []
		datas.forEach((data, i) => {
			const ns = []
			let s = 0
			const xi = new Matrix(this._d, 1, data)
			for (let j = 0; j < this._k; j++) {
				let v = 0
				if (y[i] === 0) {
					v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j]
				} else {
					v = y[i] === j + 1 ? 1 : 0
				}
				ns.push(v || 0)
				s += v || 0
			}
			const gi = ns.map(v => v / (s || 1.0))
			g.push(gi)
			x.push(xi)
			gi.forEach((v, j) => (N[j] += v))
		})

		for (let i = 0; i < this._k; i++) {
			const new_mi = new Matrix(this._d, 1)
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]))
			}
			new_mi.div(N[i])
			this._m[i] = new_mi

			const new_si = new Matrix(this._d, this._d)
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi)
				tt = tt.dot(tt.t)
				tt.mult(g[j][i])
				new_si.add(tt)
			}
			new_si.div(N[i])
			new_si.add(Matrix.eye(this._d, this._d, 1.0e-8))
			this._s[i] = new_si

			this._p[i] = N[i] / n
		}
	}
}

export class GMR extends GMM {
	// https://datachemeng.com/gaussianmixtureregression/
	constructor() {
		super()
		this._input_d = 0
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	add() {
		super.add()
		if (this._mx.length < this._m.length) {
			for (let i = this._mx.length; i < this._m.length; i++) {
				this._mx[i] = this._m[i].sliceRow(0, this._input_d)
				this._my[i] = this._m[i].sliceRow(this._input_d)
				this._sxx[i] = this._s[i].slice(0, 0, this._input_d, this._input_d)
				this._sxy[i] = this._s[i].slice(this._input_d, 0, null, this._input_d)
			}
		}
	}

	clear() {
		super.clear()
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	fit(x, y) {
		this._input_d = x[0].length
		const datas = x.map((v, i) => v.concat(y[i]))
		super.fit(datas)

		this._mx = this._m.map(m => m.sliceRow(0, this._input_d))
		this._my = this._m.map(m => m.sliceRow(this._input_d))
		this._sxx = this._s.map(m => m.slice(0, 0, this._input_d, this._input_d))
		this._sxy = this._s.map(m => m.slice(0, this._input_d, this._input_d, null))
	}

	probability(x, y) {
		const datas = x.map((v, i) => v.concat(y[i]))
		return super.probability(datas)
	}

	predict(x) {
		if (this._mx.length === 0) {
			return []
		}
		x = Matrix.fromArray(x)
		const w = new Matrix(x.rows, this._k)
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i).t
			for (let k = 0; k < this._k; k++) {
				const v = this._gaussian(xi, this._mx[k], this._sxx[k]) * this._p[k]
				w.set(i, k, v)
			}
		}
		w.div(w.sum(1))

		const ys = new Matrix(x.rows, this._my[0].cols)
		for (let k = 0; k < this._k; k++) {
			const c = x.copySub(this._mx[k].t).dot(this._sxx[k].inv()).dot(this._sxy[k])
			c.add(this._my[k])
			c.mult(w.col(k))
			ys.add(c)
		}
		return ys.toArray()
	}
}
