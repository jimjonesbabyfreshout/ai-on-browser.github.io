class SegmentedRegression {
	// http://funyakofunyao.click/2017/12/16/%E6%8A%98%E3%82%8C%E7%B7%9A%E5%9E%8B%E5%9B%9E%E5%B8%B0%E5%88%86%E6%9E%90%E3%80%82%E3%82%B9%E3%83%97%E3%83%A9%E3%82%A4%E3%83%B3%E5%85%A5%E9%96%80/
	constructor(seg = 3) {
		this._b = null
		this._seg = seg
		this._r = 40
	}

	fit(x, y) {
		x = Matrix.fromArray(x).col(0)
		y = Matrix.fromArray(y)
		const n = x.rows

		let min = Infinity
		let max = -Infinity
		for (let i = 0; i < n; i++) {
			min = Math.min(min, x.at(i, 0))
			max = Math.max(max, x.at(i, 0))
		}
		const sepx = []
		for (let i = 0; i < this._r; i++) {
			sepx.push(min + i * (max - min) / this._r)
		}
		sepx.push(max)

		const sepidx = []
		for (let i = 0; i < this._seg - 1; i++) {
			sepidx[i] = i
		}

		let min_err = Infinity
		let best_w = null
		let best_seps = null
		do {
			const xs = new Matrix(n, sepidx.length + 2)
			for (let i = 0; i < n; i++) {
				const v = x.at(i, 0)
				xs.set(i, 0, 1)
				xs.set(i, 1, v)
				for (let k = 0; k < sepidx.length; k++) {
					xs.set(i, k + 2, Math.max(0, v - sepx[sepidx[k]]))
				}
			}
			const xtx = xs.tDot(xs)
	
			const w = xtx.slove(xs.tDot(y))
			const yh = xs.dot(w)
			yh.sub(y)
			const e = yh.norm()
			if (e < min_err) {
				min_err = e
				best_w = w
				best_seps = sepidx.map(i => sepx[i])
			}
		} while (this._next_idx(sepidx, sepx.length))
		this._w = best_w
		this._seps = best_seps
	}

	_next_idx(a, n) {
		for (let i = a.length - 1; i >= 0; i--) {
			a[i]++
			if (a[i] <= n - a.length + i) {
				for (let k = i + 1; k < a.length; k++) {
					a[k] = a[i] + k - i
				}
				break
			}
		}
		return a[a.length - 1] < n
	}

	predict(x) {
		const n = x.length
		const xs = new Matrix(n, this._seps.length + 2)
		for (let i = 0; i < n; i++) {
			const v = x[i][0]
			xs.set(i, 0, 1)
			xs.set(i, 1, v)
			for (let k = 0; k < this._seps.length; k++) {
				xs.set(i, k + 2, Math.max(0, v - this._seps[k]))
			}
		}
		return xs.dot(this._w).toArray()
	}
}

var dispSegmentedRegression = function(elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const s = +elm.select("[name=s]").property("value")
			const model = new SegmentedRegression(s)
			model.fit(tx, ty);

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px);
				pred_cb(pred);
			}, 3)
		});
	};

	elm.append("span")
		.text("Segments ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "s")
		.attr("min", 1)
		.attr("max", 10)
		.attr("value", 3)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispSegmentedRegression(platform.setting.ml.configElement, platform)
}