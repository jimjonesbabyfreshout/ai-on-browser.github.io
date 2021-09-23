const argmin = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.min(...arr))
}

export class KMeansModel {
	constructor(method = null) {
		this._centroids = []
		this._method = method || new KMeans()
	}

	get centroids() {
		return this._centroids
	}

	get size() {
		return this._centroids.length
	}

	get method() {
		return this._method
	}

	set method(m) {
		this._method = m
	}

	_distance(a, b) {
		let v = 0
		for (let i = a.length - 1; i >= 0; i--) {
			v += (a[i] - b[i]) ** 2
		}
		return Math.sqrt(v)
	}

	add(datas) {
		const cpoint = this._method.add(this._centroids, datas)
		this._centroids.push(cpoint)
		return cpoint
	}

	clear() {
		this._centroids = []
	}

	predict(datas) {
		if (this._centroids.length === 0) {
			return
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v))
		})
	}

	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		const oldCentroids = this._centroids
		this._centroids = this._method.move(this, this._centroids, datas)
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return d
	}
}

export class KMeans {
	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	add(centroids, datas) {
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (
				Math.min.apply(
					null,
					centroids.map(c => this._distance(p, c))
				) > 1.0e-8
			) {
				return p.concat()
			}
		}
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n)
	}

	move(model, centroids, datas) {
		let pred = model.predict(datas)
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k)
			return this._mean(catpoints)
		})
	}
}

export class KMeanspp extends KMeans {
	add(centroids, datas) {
		if (centroids.length === 0) {
			return datas[Math.floor(Math.random() * datas.length)]
		}
		const d = datas.map(
			d =>
				Math.min.apply(
					null,
					centroids.map(c => this._distance(d, c))
				) ** 2
		)
		const s = d.reduce((acc, v) => acc + v, 0)
		let r = Math.random() * s
		for (var i = 0; i < d.length; i++) {
			if (r < d[i]) {
				return datas[i]
			}
			r -= d[i]
		}
	}
}

export class KMedoids extends KMeans {
	move(model, centroids, datas) {
		let pred = model.predict(datas)
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k)
			if (catpoints.length > 0) {
				let i = argmin(catpoints, cp => {
					return catpoints.map(cq => this._distance(cq, cp)).reduce((acc, d) => acc + d, 0)
				})
				return catpoints[i]
			} else {
				return c
			}
		})
	}
}

export class KMedians extends KMeans {
	// https://en.wikipedia.org/wiki/K-medians_clustering
	move(model, centroids, datas) {
		const pred = model.predict(datas)
		return centroids.map((c, k) => {
			const catpoints = datas.filter((v, i) => pred[i] === k)
			const dlen = catpoints.length
			if (catpoints.length > 0) {
				const cp = []
				for (let i = 0; i < c.length; i++) {
					const di = catpoints.map(v => v[i])
					di.sort((a, b) => a - b)
					if (dlen % 2 === 0) {
						cp.push((di[dlen / 2] + di[dlen / 2 - 1]) / 2)
					} else {
						cp.push(di[(dlen - 1) / 2])
					}
				}
				return cp
			} else {
				return c
			}
		})
	}
}

export class SemiSupervisedKMeansModel extends KMeansModel {
	// https://arxiv.org/abs/1307.0252
	constructor() {
		super(null)
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n)
	}

	init(datas, labels) {
		this.clear()
		const classes = [...new Set(labels.filter(v => v > 0))]
		for (let k = 0; k < classes.length; k++) {
			const labeledDatas = datas.filter((v, i) => labels[i] === k + 1)
			this._centroids.push(this._mean(labeledDatas))
		}
	}

	add() {}

	fit(datas, labels) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		const oldCentroids = this._centroids
		const pred = this.predict(datas)
		for (let i = 0; i < labels.length; i++) {
			if (labels[i] > 0 && labels[i] <= this._centroids.length) {
				pred[i] = labels[i] - 1
			}
		}
		this._centroids = this._centroids.map((c, k) => {
			const catpoints = datas.filter((v, i) => pred[i] === k)
			return this._mean(catpoints)
		})
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return d
	}
}