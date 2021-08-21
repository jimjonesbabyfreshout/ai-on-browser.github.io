import LinearInterpolation from '../model/lerp.js'

var dispLerp = function (elm, platform) {
	const calcLerp = function () {
		platform.fit((tx, ty) => {
			let model = new LinearInterpolation()
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

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLerp(platform.setting.ml.configElement, platform)
}