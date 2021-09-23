import GTM from '../../lib/model/gtm.js'

var dispGTM = function (elm, platform) {
	const mode = platform.task
	let model = null

	const fitModel = cb => {
		if (!model) {
			cb && cb()
			return
		}

		platform.fit((tx, ty, fit_cb) => {
			model.fit(tx)
			if (mode === 'CT') {
				const pred = model.predictIndex(tx)
				fit_cb(pred.map(v => v + 1))
				platform.predict((px, pred_cb) => {
					const tilePred = model.predictIndex(px)
					pred_cb(tilePred.map(v => v + 1))
				}, 4)
			} else {
				const pred = model.predict(tx)
				fit_cb(pred)
			}
			cb && cb()
		})
	}

	if (mode != 'DR') {
		elm.append('span').text(' Size ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.property('required', true)
	} else {
		elm.append('span').text(' Resolution ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('max', 100)
			.attr('min', 1)
			.attr('value', 20)
	}
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			if (platform.datas.length === 0) {
				return
			}
			const dim = platform.dimension || 1
			const resolution = +elm.select('[name=resolution]').property('value')

			model = new GTM(2, dim, resolution)
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispGTM(platform.setting.ml.configElement, platform)
}