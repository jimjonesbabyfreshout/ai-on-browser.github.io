import Matrix from '../../../lib/util/matrix.js'
import { PCA, DualPCA, KernelPCA, AnomalyPCA } from '../../../lib/model/pca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('pca', () => {
	test('project', () => {
		const model = new PCA()
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()

		model.fit(x)
		const y = model.predict(x)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('reduce', () => {
		const model = new PCA()
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()

		model.fit(x)
		const y = model.predict(x, 3)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

describe('dual', () => {
	test('project', () => {
		const model = new DualPCA()
		const x = Matrix.concat(Matrix.randn(20, 50, 0, 0.2), Matrix.randn(20, 50, 5, 0.2)).toArray()

		model.fit(x)
		const y = model.predict(x)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('reduce', () => {
		const model = new DualPCA()
		const x = Matrix.concat(Matrix.randn(20, 50, 0, 0.2), Matrix.randn(20, 50, 5, 0.2)).toArray()

		model.fit(x)
		const y = model.predict(x, 10)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

describe.each([
	['gaussian', [1.0]],
	['polynomial', [2]],
])('kernel %s %p', (kernel, args) => {
	test('project', () => {
		const model = new KernelPCA(kernel, args)
		const x = Matrix.concat(Matrix.random(20, 5, -2, 2), Matrix.random(20, 5, 5, 8)).toArray()

		model.fit(x)
		const y = model.predict(x)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('reduce', () => {
		const model = new KernelPCA(kernel, args)
		const x = Matrix.concat(Matrix.random(20, 5, -2, 2), Matrix.random(20, 5, 5, 8)).toArray()

		model.fit(x)
		const y = model.predict(x, 5)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

describe('custom kernel', () => {
	test('project', () => {
		const model = new KernelPCA((a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.concat(Matrix.random(20, 5, -2, 2), Matrix.random(20, 5, 5, 8)).toArray()

		model.fit(x)
		const y = model.predict(x)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('reduce', () => {
		const model = new KernelPCA((a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.concat(Matrix.random(20, 5, -2, 2), Matrix.random(20, 5, 5, 8)).toArray()

		model.fit(x)
		const y = model.predict(x, 5)
		const vari = Matrix.fromArray(y).variance(0)
		for (let i = 1; i < vari.cols; i++) {
			expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
		}
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

test('anomaly detection', () => {
	const model = new AnomalyPCA()
	const x = Matrix.concat(Matrix.randn(100, 2, 0, 0.2), Matrix.randn(100, 2, [5, -5], 0.2)).toArray()
	x.push([10, 10])
	model.fit(x)
	const threshold = 5
	const y = model.predict(x).map(v => v > threshold)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.1)
	expect(y[y.length - 1]).toBeTruthy()
})
