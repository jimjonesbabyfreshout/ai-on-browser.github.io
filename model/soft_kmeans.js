class SoftKMeans {
	// https://www.cs.cmu.edu/~02251/recitations/recitation_soft_clustering.pdf
	// http://soqdoq.com/teq/?p=686
	constructor(beta = 1) {
		this._beta = beta
		this._c = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(datas) {
		this._x = datas
	}

	add() {
		let cp = null
		while (true) {
			const i = Math.floor(Math.random() * this._x.length)
			cp = this._x[i]
			if (this._c.every(c => this._distance(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
	}

	_responsibility() {
		const r = []
		for (let i = 0; i < this._x.length; i++) {
			let s = 0
			const ri = []
			for (let k = 0; k < this._c.length; k++) {
				ri[k] = Math.exp(-this._beta * this._distance(this._c[k], this._x[i]))
				s += ri[k]
			}
			r.push(ri.map(v => v / s))
		}
		return r
	}

	fit() {
		const r = this._responsibility()
		for (let k = 0; k < this._c.length; k++) {
			const c = Array(this._c[k].length).fill(0)
			let s = 0
			for (let i = 0; i < r.length; i++) {
				for (let j = 0; j < this._x[i].length; j++) {
					c[j] += r[i][k] * this._x[i][j]
				}
				s += r[i][k]
			}
			this._c[k] = c.map(v => v / s)
		}
	}

	predict() {
		return Matrix.fromArray(this._responsibility()).argmax(1).value
	}
}

var dispFuzzyCMeans = function(elm, platform) {
	let model = null

	const fitModel = (update, cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (update) {
				model.fit()
			}
			pred_cb(model.predict().map(v => v + 1))
			platform.centroids(model._c, model._c.map((c, i) => i + 1))
			cb && cb()
		});
	}

	elm.append("span")
		.text("beta");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("max", 1000)
		.attr("min", 0)
		.attr("step", 0.1)
		.attr("value", 10)
	const addCentroid = () => {
		model.add()
		elm.select("[name=clusternumber]")
			.text(model._c.length + " clusters");
		platform.centroids(model._c, model._c.map((c, i) => i + 1))
		fitModel(false)
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.fit((tx, ty) => {
			const b = +elm.select("[name=b]").property("value")
			model = new SoftKMeans(b)
			model.init(tx)
		})
		platform.init()

		addCentroid()
	});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", addCentroid);
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	slbConf.step((cb) => {
		fitModel(true, cb)
	}).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispFuzzyCMeans(platform.setting.ml.configElement, platform)
}
