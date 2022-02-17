import MOD from '../../lib/model/mod.js'

var dispMOD = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new MOD(tx, dim)
			}
			const pred = model.fit()
			pred_cb(pred)
			cb && cb()
		})
	}
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMOD(platform.setting.ml.configElement, platform)
}