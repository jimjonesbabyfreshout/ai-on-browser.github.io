import { Probit, MultinomialProbit } from '../model/probit.js'
import EnsembleBinaryModel from '../js/ensemble.js'

var dispProbit = function (elm, platform) {
	let model = null

	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		platform.fit((tx, ty) => {
			if (!model) {
				if (method === 'multinomial') {
					model = new MultinomialProbit()
				} else {
					model = new EnsembleBinaryModel(Probit, method)
					model.init(
						tx,
						ty.map(v => v[0])
					)
				}
			}
			model.fit(tx, ty)
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
		.data(['oneone', 'onerest', 'multinomial'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
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
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispProbit(platform.setting.ml.configElement, platform)
}
