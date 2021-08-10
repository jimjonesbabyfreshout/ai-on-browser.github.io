class SmoothstepInterpolation {
	// https://codeplea.com/simple-interpolation
	// https://en.wikipedia.org/wiki/Smoothstep
	constructor(n = 1) {
		this._n = n
	}

	_c(n, k) {
		let v = 1
		for (let i = 0; i < k; i++) {
			v *= n - i
			v /= i + 1
		}
		return v
	}

	_s(t) {
		let v = 0
		for (let i = 0; i <= this._n; i++) {
			v += this._c(-this._n - 1, i) * this._c(2 * this._n + 1, this._n - i) * t ** (this._n + i + 1)
		}
		return v
	}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	predict(target) {
		const n = this._x.length
		return target.map(t => {
			if (t <= this._x[0]) {
				return this._y[0]
			} else if (t >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= this._x[i]) {
					const p = (t - this._x[i - 1]) / (this._x[i] - this._x[i - 1])
					const m = this._s(p)
					return (1 - m) * this._y[i - 1] + m * this._y[i]
				}
			}
			return this._y[n - 1]
		})
	}
}

var dispSmoothstep = function(elm, platform) {
	const calcSmoothstep = function() {
		const n = +elm.select("[name=n]").property("value")
		platform.fit((tx, ty) => {
			let model = new SmoothstepInterpolation(n);
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append("span")
		.text(" n ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("value", 1)
		.attr("min", 0)
		.attr("max", 100)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcSmoothstep);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSmoothstep(platform.setting.ml.configElement, platform);
}