import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LSTMLayer from '../../../../../lib/model/nns/layer/lstm.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new LSTMLayer({ size: 4 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Matrix.randn(10, 3)
			expect(() => layer.calc(x)).toThrow()
		})

		test('tensor', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence', () => {
			const layer = new LSTMLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 7, 4])
		})
	})

	describe('grad', () => {
		test('no sequence', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence', () => {
			const layer = new LSTMLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Tensor.ones([10, 7, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})
	})

	test('toObject', () => {
		const layer = new LSTMLayer({ size: 4 })

		const obj = layer.toObject()
		expect(obj.type).toBe('lstm')
		expect(obj.return_sequences).toBeFalsy()
		expect(obj.size).toBe(4)
		for (let i = 0; i < 4; i++) {
			expect(obj.b_z[0][i]).toBe(0)
			expect(obj.b_in[0][i]).toBe(0)
			expect(obj.b_for[0][i]).toBe(0)
			expect(obj.b_out[0][i]).toBe(0)
			expect(obj.r_z[i]).toHaveLength(4)
			expect(obj.r_in[i]).toHaveLength(4)
			expect(obj.r_for[i]).toHaveLength(4)
			expect(obj.r_out[i]).toHaveLength(4)
			expect(obj.p_in[0][i]).toBe(0)
			expect(obj.p_for[0][i]).toBe(0)
			expect(obj.p_out[0][i]).toBe(0)
		}
	})

	test('fromObject', () => {
		const orglayer = new LSTMLayer({ size: 4 })
		orglayer.calc(Tensor.randn([10, 7, 5]))
		const layer = LSTMLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(LSTMLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'lstm', size: 4 }], 'mse', 'adam')
		const x = Tensor.random([1, 7, 5], -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.8, 0.8)

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
