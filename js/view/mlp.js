import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class MLPWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/mlp_worker.js', { type: 'module' })
	}

	initialize(type, hidden_sizes, activation, optimizer) {
		return this._postMessage({ mode: 'init', type, hidden_sizes, activation, optimizer })
	}

	fit(train_x, train_y, iteration, rate, batch) {
		return this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch })
	}

	predict(x) {
		return this._postMessage({ mode: 'predict', x: x })
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const mode = platform.task
	const model = new MLPWorker()
	let epoch = 0

	const fitModel = async cb => {
		const dim = getInputDim()

		let tx = platform.trainInput
		let ty = platform.trainOutput
		const x = Matrix.fromArray(tx)
		if (mode === 'TP') {
			ty = tx.slice(dim)
			tx = []
			for (let i = 0; i < x.rows - dim; i++) {
				tx.push(x.slice(i, i + dim).value)
			}
		}
		if (mode === 'CF') {
			ty = ty.map(v => v[0])
		}
		const e = await model.fit(tx, ty, +iteration.value, rate.value, batch.value)
		epoch = e.data.epoch
		platform.plotLoss(e.data.loss)
		if (mode === 'TP') {
			let lx = x.slice(x.rows - dim).value
			const p = []
			while (true) {
				if (p.length >= predCount.value) {
					platform.trainResult = p

					cb && cb()
					return
				}
				const e = await model.predict([lx])
				p.push(e.data[0])
				lx = lx.slice(x.cols)
				lx.push(...e.data[0])
			}
		} else {
			const e = await model.predict(platform.testInput(dim === 1 ? 2 : 4))
			const data = e.data
			platform.testResult(data)

			cb && cb()
		}
	}

	const getInputDim = () => {
		return mode === 'TP' ? width.value : platform.datas.dimension || 2
	}

	let width = null
	if (mode === 'TP') {
		width = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 20 })
	}

	const hidden_sizes = controller.array({
		label: ' Hidden Layers ',
		type: 'number',
		values: [10],
		default: 10,
		min: 1,
		max: 100,
	})
	const activation = controller.select({
		label: ' Activation ',
		values: [
			'sigmoid',
			'tanh',
			'relu',
			'elu',
			'leaky_relu',
			'rrelu',
			'prelu',
			'gaussian',
			'softplus',
			'softsign',
			'identity',
		],
	})

	const optimizer = controller.select({ label: ' Optimizer ', values: ['sgd', 'adam', 'momentum', 'rmsprop'] })
	const slbConf = controller.stepLoopButtons().init(done => {
		if (platform.datas.length === 0) {
			done()
			return
		}

		model
			.initialize(
				mode === 'CF' ? 'classifier' : 'regressor',
				hidden_sizes.value,
				activation.value,
				optimizer.value
			)
			.then(done)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	let predCount
	if (mode === 'TP') {
		predCount = controller.input.number({ label: ' predict count', min: 1, max: 1000, value: 100 })
	} else {
		predCount = controller.input({ type: 'hidden', value: 0 })
	}

	platform.setting.ternimate = () => {
		model.terminate()
	}
}
