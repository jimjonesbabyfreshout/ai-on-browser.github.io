export default class LatentDirichletAllocation {
	// https://shuyo.hatenablog.com/entry/20110214/lda
	constructor(t = 2) {
		this._k = t
		this._alpha = 0.1
		this._beta = 0.1
	}

	init(datas, resolution = 20) {
		this._x = Matrix.fromArray(datas)
		const max = this._x.max(0).value
		const min = this._x.min(0).value

		this._w = datas.map(d => {
			return d.map((v, i) => {
				return Math.floor(((v - min[i]) / (max[i] - min[i])) * (resolution - 1)) + i * resolution
			})
		})
		this._zmn = []
		this._nmz = new Matrix(this._w.length, this._k, this._alpha)
		this._nzt = new Matrix(this._k, resolution * this._x.cols, this._beta)
		this._nz = this._nzt.sum(1)

		this._n = 0
		for (let m = 0; m < this._w.length; m++) {
			this._n += this._w[m].length
			this._zmn[m] = []
			for (let k = 0; k < this._w[m].length; k++) {
				const z = Math.floor(Math.random() * this._k)
				this._zmn[m][k] = z

				this._nmz.addAt(m, z, 1)
				this._nzt.addAt(z, this._w[m][k], 1)
				this._nz.addAt(z, 0, 1)
			}
		}
	}

	fit() {
		for (let m = 0; m < this._w.length; m++) {
			for (let k = 0; k < this._w[m].length; k++) {
				const z = this._zmn[m][k]
				this._nmz.subAt(m, z, 1)
				this._nzt.subAt(z, this._w[m][k], 1)
				this._nz.subAt(z, 0, 1)

				const pz = this._nzt.col(this._w[m][k])
				pz.mult(this._nmz.row(m).t)
				pz.div(this._nz)
				pz.div(pz.sum())

				let r = Math.random()
				let new_z = 0
				for (; new_z < this._k; new_z++) {
					r -= pz.at(new_z, 0)
					if (r < 0) {
						break
					}
				}
				this._zmn[m][k] = new_z
				this._nmz.addAt(m, new_z, 1)
				this._nzt.addAt(new_z, this._w[m][k], 1)
				this._nz.addAt(new_z, 0, 1)
			}
		}
	}

	predict() {
		return this._nmz.argmax(1).value
	}
}
