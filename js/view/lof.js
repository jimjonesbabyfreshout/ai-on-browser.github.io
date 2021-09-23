import LOF from '../../lib/model/lof.js'

var dispLOF = function (elm, platform) {
	const mode = platform.task
	let k_value = 5

	const calcLOF = function () {
		const threshold = +elm.select('[name=threshold]').property('value')
		let model = new LOF(k_value)
		if (mode === 'AD') {
			platform.fit((tx, ty, cb) => {
				const pred = model.predict(tx)
				cb(pred.map(v => v > threshold))
			})
		} else {
			platform.fit((tx, ty, cb) => {
				const d = +elm.select('[name=window]').property('value')
				const data = tx.rolling(d)
				const pred = model.predict(data)
				for (let i = 0; i < d / 2; i++) {
					pred.unshift(1)
				}
				cb(pred, threshold)
			})
		}
	}

	if (mode === 'CP') {
		elm.append('span').text(' window = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'window')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.on('change', function () {
				calcLOF()
			})
	}
	elm.append('span').text(' k = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('value', k_value)
		.attr('min', 1)
		.attr('max', 10)
		.on('change', function () {
			k_value = +d3.select(this).property('value')
		})
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 100)
		.property('required', true)
		.attr('step', 0.1)
		.on('change', function () {
			calcLOF()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLOF)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLOF(platform.setting.ml.configElement, platform)
}