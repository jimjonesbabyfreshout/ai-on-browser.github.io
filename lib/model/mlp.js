import NeuralNetwork from './neuralnetwork.js'

export default class MLP {
	constructor(output_size, layers, optimizer) {
		this._type = output_size ? 'classifier' : 'regression'
		this._output_size = output_size
		this._layers = [{ type: 'input' }]
		this._layers.push(...layers)
		this._layers.push({
			type: 'full',
			out_size: output_size || 1,
		})
		if (output_size) {
			this._layers.push({
				type: 'sigmoid',
			})
		}

		this._model = new NeuralNetwork(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	get type() {
		return this._type
	}

	get output_size() {
		return this._output_size
	}

	get epoch() {
		return this._epoch
	}

	fit(train_x, train_y, iteration, rate, batch) {
		if (this._type === 'classifier' && (!Array.isArray(train_y[0]) || train_y[0].length === 1)) {
			const y = []
			for (const v of train_y) {
				const a = Array(this._output_size).fill(0)
				if (!Array.isArray(v)) {
					a[v] = 1
				} else if (v.length === 1) {
					a[v[0]] = 1
				}
				y.push(a)
			}
			train_y = y
		}
		this._model.fit(train_x, train_y, iteration, rate, batch)
		this._epoch += iteration
	}

	predict(x) {
		const pred = this._model.calc(x)
		return pred.toArray()
	}
}