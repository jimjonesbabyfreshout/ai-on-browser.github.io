import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'softsign' })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = Layer.fromObject({ type: 'softsign' })

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, j) / (1 + Math.abs(x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const layer = Layer.fromObject({ type: 'softsign' })

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBe(1 / (1 + Math.abs(x.at(i, j))) ** 2)
			}
		}
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'softsign' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'softsign' })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'softsign' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) / (1 + Math.abs(x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softsign' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.9, 0.9)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})