import { jest } from '@jest/globals'
jest.retryTimes(5)

import { Matrix } from '../../../lib/util/math.js'
import { Probit, MultinomialProbit } from '../../../lib/model/probit.js'

describe('probit', () => {
	test('default', () => {
		const model = new Probit()
	})

	test('fit', () => {
		const model = new Probit()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 200; i++) {
			model.fit()
		}
		const y = model.predict(x)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (Math.sign(y[i]) === Math.sign(t[i])) {
				acc++
			}
		}
		expect(acc / y.length).toBeGreaterThan(0.95)
	})
})

describe('multinomial', () => {
	test('default', () => {
		const model = new MultinomialProbit()
	})

	test('fit', () => {
		const model = new MultinomialProbit()
		const x = Matrix.randn(50, 2, 0, 0.1).concat(Matrix.randn(50, 2, 5, 0.1)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [Math.floor(i / 50)]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (y[i] === t[i][0]) {
				acc++
			}
		}
		expect(acc / y.length).toBeGreaterThan(0.95)
	})
})