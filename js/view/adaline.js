import ADALINE from '../../lib/model/adaline.js'
import EnsembleBinaryModel from '../../lib/util/ensemble.js'

var dispADALINE = function (elm, platform) {
	let model = null
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			if (!model) {
				model = new EnsembleBinaryModel(ADALINE, method, null, [rate])
				model.init(tx, ty)
			}
			model.fit()

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px)
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	dispADALINE(platform.setting.ml.configElement, platform)
}