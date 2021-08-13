import QuantileRegression from '../model/quantile_regression.js'

var dispQuantile = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const t = +elm.select('[name=t]').property('value')
			const lr = +elm.select('[name=lr]').property('value')
			if (!model) {
				model = new QuantileRegression(t, lr)
			}
			model.lr = lr
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('value', 0.001)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.001)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispQuantile(platform.setting.ml.configElement, platform)
}
