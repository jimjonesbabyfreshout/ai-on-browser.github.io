import XMeans from '../model/xmeans.js'

var dispXMeans = function (elm, platform) {
	const model = new XMeans()

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				model.fit(tx, 1)
				const pred = model.predict(platform.datas.x)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{
					line: true,
				}
			)
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Clear centroid')
		.on('click', () => {
			model.clear()
			platform.init()
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispXMeans(platform.setting.ml.configElement, platform)
}
