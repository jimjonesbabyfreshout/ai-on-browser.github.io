class LSDD {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.473.3093&rep=rep1&type=pdf
	// Learning under Non-Stationarity: Covariate Shift Adaptation, Class-Balance Change Adaptation, and Change Detection. (2014)
	constructor(sigma, lambda) {
		this._sigma_cand = sigma
		this._lambda_cand = lambda
	}

	_kernel_gaussian(x, c, s) {
		const k = []
		for (let i = 0; i < c.rows; i++) {
			const ki = []
			for (let j = 0; j < x.rows; j++) {
				const r = c.row(i).copySub(x.row(j))
				ki.push(Math.exp(-r.reduce((ss, v) => ss + v ** 2, 0) / (2 * s ** 2)))
			}
			k.push(ki)
		}
		return Matrix.fromArray(k)
	}

	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows
		const n2 = x2.rows
		const n = n1 + n2
		const d = x1.cols

		const centers = this._centers = x1.concat(x2, 0)

		this._sigma = this._sigma_cand[0]
		this._lambda = this._lambda_cand[0]

		let best_score = Infinity
		for (const sgm of this._sigma_cand) {
			const u = this._kernel_gaussian(centers, centers, sgm * Math.SQRT2)
			u.mult((Math.PI * sgm ** 2) ** (d / 2))

			const v1 = this._kernel_gaussian(x1, centers, sgm).mean(1)
			const v2 = this._kernel_gaussian(x2, centers, sgm).mean(1)
			const v = v1.copySub(v2)

			for (const lmb of this._lambda_cand) {
				const alpha = u.copyAdd(Matrix.eye(n, n, lmb)).slove(v)
				const score = alpha.tDot(u).dot(alpha).value[0] - 2 * v.tDot(alpha).value[0] + lmb * alpha.norm() ** 2
				if (score < best_score) {
					best_score = score
					this._sigma = sgm
					this._lambda = lmb
					this._kw = alpha
				}
			}
		}
	}

	predict(x) {
		const phi = this._kernel_gaussian(x, this._centers, this._sigma)
		return phi.tDot(this._kw).value
	}
}

class LSDDCPD {
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window).flat())
		}

		const pred = []
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take))
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag))

			const grid = [100, 30, 10, 3, 1, 0.3, 0.1, 0.03, 0.01, 0.003, 0.001]
			const model = new LSDD(grid, grid)
			let c = 0
			model.fit(h, t)
			let dr = model.predict(t)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] ** 2) / dr.length
			}
			dr = model.predict(h)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] ** 2) / dr.length
			}
			pred.push(Math.sqrt(c))
		}
		return pred
	}
}

var dispLSDD = function(elm, platform) {
	let thupdater = null
	const calcLSDD = function() {
		platform.fit((tx, ty, cb, thup) => {
			const d = +elm.select("[name=window]").property("value");
			let model = new LSDDCPD(d);
			const threshold = +elm.select("[name=threshold]").property("value")
			const pred = model.predict(tx)
			for (let i = 0; i < d * 3 / 4; i++) {
				pred.unshift(0)
			}
			thupdater = thup
			cb(pred, threshold)
		})
	}

	elm.append("span")
		.text(" window = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "window")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 300)
		.attr("min", 0)
		.attr("max", 10000)
		.attr("step", 0.1)
		.on("change", () => {
			const threshold = +elm.select("[name=threshold]").property("value")
			if (thupdater) {
				thupdater(threshold)
			}
		})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcLSDD);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLSDD(platform.setting.ml.configElement, platform)
}
