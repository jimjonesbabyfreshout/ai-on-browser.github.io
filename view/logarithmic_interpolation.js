import LogarithmicInterpolation from '../model/logarithmic_interpolation.js'

var dispLI = function (elm, platform) {
	const calcLI = function () {
		platform.fit((tx, ty) => {
			let model = new LogarithmicInterpolation()
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

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLI)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLI(platform.setting.ml.configElement, platform)
}