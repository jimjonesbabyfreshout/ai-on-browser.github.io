import { MDS } from '../../lib/model/mds.js'

var dispMDS = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			const dim = platform.dimension
			const y = MDS(tx, dim)
			pred_cb(y)
		})
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMDS(platform.setting.ml.configElement, platform)
}