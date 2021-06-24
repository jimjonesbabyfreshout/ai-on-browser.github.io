class CosineInterpolation {
	// http://paulbourke.net/miscellaneous/interpolation/
	constructor() {
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
					const m = (1 - Math.cos(p * Math.PI)) / 2
					return (1 - m) * this._y[i - 1] + m * this._y[i]
				}
			}
			return this._y[n - 1]
		})
	}
}

var dispCosineInterpolation = function(elm, platform) {
	const calcCosineInterpolation = function() {
		platform.fit((tx, ty) => {
			let model = new CosineInterpolation();
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcCosineInterpolation);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCosineInterpolation(platform.setting.ml.configElement, platform);
}
