import HermitInterpolation from '../model/hermit_interpolation.js'

var dispHermitInterpolation = function (elm, platform) {
	const calcHermitInterpolation = function () {
		const tension = +elm.select('[name=tension]').property('value')
		const bias = +elm.select('[name=bias]').property('value')
		platform.fit((tx, ty) => {
			let model = new HermitInterpolation(tension, bias)
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append('span').text(' tension ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'tension')
		.attr('value', 0)
		.attr('min', -1)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', calcHermitInterpolation)
	elm.append('span').text(' bias ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'bias')
		.attr('value', 0)
		.attr('min', -100)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', calcHermitInterpolation)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcHermitInterpolation)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispHermitInterpolation(platform.setting.ml.configElement, platform)
}