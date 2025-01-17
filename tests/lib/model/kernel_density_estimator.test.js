import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import KernelDensityEstimator from '../../../lib/model/kernel_density_estimator.js'

import { correlation } from '../../../lib/evaluate/regression.js'

describe('density estimation', () => {
	test('default', () => {
		const model = new KernelDensityEstimator()
		const n = 500
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			p[i] = (p1 + p2) / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.9)
	})

	test.each([undefined, 'gaussian', 'triangular', 'epanechnikov', 'biweight', 'triweight'])('kernel %s', kernel => {
		const model = new KernelDensityEstimator(0, kernel)
		const n = 500
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			p[i] = (p1 + p2) / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.9)
	})

	test.each(['rectangular'])('kernel %s', kernel => {
		const model = new KernelDensityEstimator(0, kernel)
		const n = 500
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			p[i] = (p1 + p2) / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.8)
	})

	test('custom kernel', () => {
		const model = new KernelDensityEstimator(1.0, v => 1 / (v + 1.0e-8))
		const n = 500
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x, 1.0)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			p[i] = (p1 + p2) / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.9)
	})
})
