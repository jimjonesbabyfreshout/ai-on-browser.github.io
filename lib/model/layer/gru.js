import Layer from './base.js'
import { Matrix, Tensor } from '../../util/math.js'

export default class GRULayer extends Layer {
	constructor({ size, return_sequences = false, ...rest }) {
		super(rest)
		this._size = size

		this._w_z = null
		this._w_r = null
		this._w_h = null

		this._u_z = Matrix.randn(this._size, this._size)
		this._u_r = Matrix.randn(this._size, this._size)
		this._u_h = Matrix.randn(this._size, this._size)

		this._b_z = Matrix.zeros(1, this._size)
		this._b_r = Matrix.zeros(1, this._size)
		this._b_h = Matrix.zeros(1, this._size)

		this._s0 = Matrix.zeros(1, this._size)

		this._return_sequences = return_sequences
	}

	_sigmoid(x) {
		return x.copyMap(v => 1 / (1 + Math.exp(-v)))
	}

	_grad_sigmoid(y) {
		return y.copyMap(v => v * (1 - v))
	}

	_tanh(x) {
		return x.copyMap(Math.tanh)
	}

	_grad_tanh(y) {
		return y.copyMap(v => 1 - v ** 2)
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._x = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._x[k] = x.at(k).toMatrix()
		}
		if (!this._w_z) {
			this._w_z = Matrix.randn(this._x[0].cols, this._size)
			this._w_r = Matrix.randn(this._x[0].cols, this._size)
			this._w_h = Matrix.randn(this._x[0].cols, this._size)
		}
		this._h = []
		this._s = []
		this._z = []
		this._r = []

		for (let k = 0; k < this._x.length; k++) {
			const pre_s = k === 0 ? this._s0 : this._s[k - 1]

			const zb = this._x[k].dot(this._w_z)
			zb.add(pre_s.dot(this._u_z))
			zb.add(this._b_h)
			const z = this._sigmoid(zb)
			this._z[k] = z

			const rb = this._x[k].dot(this._w_r)
			rb.add(pre_s.dot(this._u_r))
			rb.add(this._b_r)
			const r = this._sigmoid(rb)
			this._r[k] = r

			const hb = this._x[k].dot(this._w_h)
			hb.add(r.copyMult(pre_s).dot(this._u_h))
			hb.add(this._b_h)
			const h = this._tanh(hb)
			this._h[k] = h

			this._s[k] = z.copyIsub(1)
			this._s[k].mult(h)
			this._s[k].add(z.copyMult(pre_s))
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(this._s.map(v => v.toArray()))
			return t.transpose(1, 0, 2)
		}
		return this._s[this._s.length - 1]
	}

	grad(bo) {
		return this._grad_bptt(bo)
	}

	_grad_bptt(bo) {
		const s = this._s.length
		this._bo = Array(s)
		if (this._return_sequences) {
			bo = bo.transpose(1, 0, 2)
			for (let i = 0; i < s; i++) {
				this._bo[i] = bo.at(i).toMatrix()
			}
		} else {
			this._bo[s - 1] = bo
		}

		this._dy = []
		this._dr = []
		this._dz = []
		this._dh = []

		const bi = []
		for (let t = s - 1; t >= 0; t--) {
			const pre_s = t === 0 ? this._s0 : this._s[t - 1]
			this._dy[t] = this._bo[t] || Matrix.zeros(1, 1)
			if (t < s - 1) {
				this._dy[t].add(this._dz[t + 1].dot(this._u_z.t))
				this._dy[t].add(this._dr[t + 1].dot(this._u_r.t))
				this._dy[t].add(this._dh[t + 1].dot(this._u_h.t).copyMult(this._r[t + 1]))
				this._dy[t].add(this._z[t + 1].copyMult(this._dy[t + 1]))
			}

			this._dz[t] = pre_s.copyMult(this._dy[t])
			this._dz[t].sub(this._h[t].copyMult(this._dy[t]))
			this._dz[t].mult(this._grad_sigmoid(this._z[t]))

			this._dh[t] = this._z[t].copyIsub(1)
			this._dh[t].mult(this._dy[t])
			this._dh[t].mult(this._grad_tanh(this._h[t]))

			this._dr[t] = this._dh[t].dot(this._u_h.t)
			this._dr[t].mult(pre_s)
			this._dr[t].mult(this._grad_sigmoid(this._r[t]))

			bi[t] = this._dh[t].dot(this._w_h.t)
			bi[t].add(this._dz[t].dot(this._w_z.t))
			bi[t].add(this._dr[t].dot(this._w_r.t))
		}
		const t = Tensor.fromArray(bi.map(b => b.toArray()))
		return t.transpose(1, 0, 2)
	}

	update() {
		this._update_bptt()
	}

	_update_bptt() {
		const s = this._s.length
		const n = this._x[0].rows

		const dw_r = Matrix.zeros(...this._w_r.sizes)
		const dw_z = Matrix.zeros(...this._w_z.sizes)
		const dw_h = Matrix.zeros(...this._w_h.sizes)
		const db_r = Matrix.zeros(1, this._size)
		const db_z = Matrix.zeros(1, this._size)
		const db_h = Matrix.zeros(1, this._size)
		for (let t = 0; t < s; t++) {
			const dwr = this._x[t].tDot(this._dr[t])
			dwr.div(n)
			dw_r.add(dwr)
			const dwz = this._x[t].tDot(this._dz[t])
			dwz.div(n)
			dw_z.add(dwz)
			const dwh = this._x[t].tDot(this._dh[t])
			dwh.div(n)
			dw_h.add(dwh)
			db_r.add(this._dr[t].mean(0))
			db_z.add(this._dz[t].mean(0))
			db_h.add(this._dh[t].mean(0))
		}
		this._w_r.sub(this._opt.delta('w_r', dw_r))
		this._w_z.sub(this._opt.delta('w_z', dw_z))
		this._w_h.sub(this._opt.delta('w_h', dw_h))
		this._b_r.sub(this._opt.delta('b_r', db_r))
		this._b_z.sub(this._opt.delta('b_z', db_z))
		this._b_h.sub(this._opt.delta('b_h', db_h))

		const du_r = Matrix.zeros(this._size, this._size)
		const du_z = Matrix.zeros(this._size, this._size)
		const du_h = Matrix.zeros(this._size, this._size)
		for (let t = 0; t < s - 1; t++) {
			const dur = this._s[t].tDot(this._dr[t + 1])
			dur.div(n)
			du_r.add(dur)
			const duz = this._s[t].tDot(this._dz[t + 1])
			duz.div(n)
			du_z.add(duz)
			const duh = this._s[t].tDot(this._dh[t + 1])
			duh.div(n)
			du_h.add(duh)
		}
		this._u_r.sub(this._opt.delta('u_r', du_r))
		this._u_z.sub(this._opt.delta('u_z', du_z))
		this._u_h.sub(this._opt.delta('u_h', du_h))
	}
}