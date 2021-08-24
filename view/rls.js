import RecursiveLeastSquares from '../model/rls.js'
import EnsembleBinaryModel from '../js/ensemble.js'

var dispRLS = function (elm, platform) {
	const calc = cb => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			let model = null
			if (platform.task === 'CF') {
				const method = elm.select('[name=method]').property('value')
				model = new EnsembleBinaryModel(RecursiveLeastSquares, method)
			} else {
				model = new RecursiveLeastSquares()
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px)
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	if (platform.task === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRLS(platform.setting.ml.configElement, platform)
}
