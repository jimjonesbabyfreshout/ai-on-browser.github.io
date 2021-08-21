import ParticleFilter from '../model/particle_filter.js'

var dispParticleFilter = function (elm, platform) {
	const task = platform.task
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const model = new ParticleFilter()
			const f = model.fit(tx)
			if (task === 'TP') {
				const c = +elm.select('[name=c]').property('value')
				const pred = model.predict(c)
				pred_cb(pred)
			} else {
				pred_cb(f)
			}
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	if (task === 'TP') {
		elm.append('span').text('predict count')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'c')
			.attr('min', 1)
			.attr('max', 100)
			.attr('value', 100)
			.on('change', fitModel)
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispParticleFilter(platform.setting.ml.configElement, platform)
}