export default class MeanShift {
	// see http://seiya-kumada.blogspot.com/2013/05/mean-shift.html
	// see http://takashiijiri.com/study/ImgProc/MeanShift.htm
	constructor(h, threshold) {
		this._x = null
		this._centroids = null
		this._h = h
		this._threshold = threshold
		this._categories = 0
	}

	get categories() {
		return this._categories
	}

	get h() {
		return this._h
	}

	set h(value) {
		this._h = value
	}

	set threshold(value) {
		this._threshold = value
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(data) {
		this._x = data
		this._centroids = this._x.map(v => [].concat(v))
	}

	predict() {
		this._categories = 0
		const p = []
		for (let i = 0; i < this._centroids.length; i++) {
			let category = i
			for (let k = 0; k < i; k++) {
				if (this._distance(this._centroids[i], this._centroids[k]) < this._threshold) {
					category = p[k]
					break
				}
			}
			if (category === i) this._categories++
			p[i] = category
		}
		return p
	}

	fit() {
		if (this._centroids.length === 0 || this._x.length === 0) {
			return
		}
		const d = this._centroids[0].length
		const Vd = Math.PI * this._h ** 2
		const G = (x, x1) => (x.reduce((acc, v, i) => acc + ((v - x1[i]) / this._h) ** 2, 0) <= 1 ? 1 : 0)
		const mg = gvalues => {
			let s = 0
			let v = Array(this._x[0].length).fill(0)
			for (let i = 0; i < this._x.length; i++) {
				if (gvalues[i]) {
					s += gvalues[i]
					for (let k = 0; k < v.length; k++) {
						v[k] += this._x[i][k] * gvalues[i]
					}
				}
			}
			return v.map(a => a / s)
		}
		const sg = (x, gvalues) => mg(gvalues).map((v, i) => v - x[i])
		const fg = gvalues => {
			return gvalues.reduce((acc, v) => acc + v, 0) / (gvalues.length * Vd)
		}
		const fd = x => {
			let gvalues = this._x.map(p => G(x, p))
			return sg(x, gvalues)
			//return sg(x, gvalues).mult(2 / (this._h ** 2) * fg(gvalues));
		}
		let isChanged = false
		this._centroids = this._centroids.map((c, i) => {
			let oldPoint = c
			const v = fd(c)
			const newPoint = c.map((a, i) => a + v[i])
			isChanged |= oldPoint.some((v, i) => v !== newPoint[i])
			return newPoint
		})

		return isChanged
	}
}