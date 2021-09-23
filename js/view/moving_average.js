import { simpleMovingAverage, linearWeightedMovingAverage, triangularMovingAverage } from '../../lib/model/moving_average.js'

var dispMovingAverage = function (elm, platform) {
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const k = +elm.select('[name=k]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			let pred = []
			switch (method) {
				case 'simple':
					pred = simpleMovingAverage(tx, k)
					break
				case 'linear weighted':
					pred = linearWeightedMovingAverage(tx, k)
					break
				case 'triangular':
					pred = triangularMovingAverage(tx, k)
					break
			}
			pred_cb(pred)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.on('change', () => {
			fitModel()
		})
		.selectAll('option')
		.data(['simple', 'linear weighted', 'triangular'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('k')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingAverage(platform.setting.ml.configElement, platform)
}