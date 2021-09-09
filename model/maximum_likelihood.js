import { Matrix } from '../js/math.js'

export default class MaximumLikelihoodEstimator {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/prnn/node7.html
	constructor(distribution = 'normal') {
		this._distribution = distribution
	}

	fit(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			this._m = x.mean(0)
			this._s = x.cov()
		}
	}

	probability(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			const d = Math.sqrt(2 * Math.PI * this._s.det()) ** x.cols
			x.sub(this._m)
			const v = x.dot(this._s.inv())
			v.mult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / d)
			return s.value
		}
	}

	predict(x) {
		return this.probability(x)
	}
}
