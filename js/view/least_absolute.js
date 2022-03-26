import LeastAbsolute from '../../lib/model/least_absolute.js'
import Controller from '../controller.js'

var dispLAD = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			if (!model) {
				model = new LeastAbsolute()
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLAD(platform.setting.ml.configElement, platform)
}
