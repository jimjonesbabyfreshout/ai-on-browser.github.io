import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class CondLayer extends Layer {
	calc(...x) {
		this._cond = x[0]
		const t = x[1]
		const f = x[2]
		this._o = new Matrix(this._cond.rows, this._cond.cols)
		this._o.map((v, i) => (this._cond.value[i] ? t.value[i] : f.value[i]))
		return this._o
	}

	grad(bo) {
		const bi = [null, bo.copy(), bo.copy()]
		this._cond.forEach((v, i) => (v ? (bi[2].value[i] = 0) : (bi[1].value[i] = 0)))
		return bi
	}
}