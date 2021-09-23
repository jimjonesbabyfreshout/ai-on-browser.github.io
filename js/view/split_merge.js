import SplitAndMerge from '../../lib/model/split_merge.js'

var dispSAM = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const method = elm.select('[name=method]').property('value')
			const th = +elm.select('[name=threshold]').property('value')
			const model = new SplitAndMerge(method, th)
			let y = model.predict(tx)
			pred_cb(y)
		}, 4)
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['uniformity', 'variance'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 10)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSAM(platform.setting.ml.configElement, platform)
}