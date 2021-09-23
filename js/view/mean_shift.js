import MeanShift from '../../lib/model/mean_shift.js'

var dispMeanShift = function (elm, platform) {
	const svg = platform.svg
	const csvg = svg.insert('g', ':first-child').attr('class', 'centroids').attr('opacity', 0.8)
	let c = []

	let model = new MeanShift(50, 10)
	const orgScale = platform.datas.scale
	platform.datas.scale = 1

	const plot = () => {
		platform.fit((tx, ty, pred_cb) => {
			const pred = model.predict()
			pred_cb(pred.map(v => v + 1))
			for (let i = 0; i < c.length; i++) {
				c[i]
					.attr('stroke', getCategoryColor(pred[i] + 1))
					.attr('cx', model._centroids[i][0])
					.attr('cy', model._centroids[i][1])
			}
		})
	}

	elm.append('input').attr('type', 'number').attr('name', 'h').attr('value', 100).attr('min', 10).attr('max', 200)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model.h = +elm.select('[name=h]').property('value')
			model.threshold = +elm.select('[name=threshold]').property('value')
			platform.fit((tx, ty) => {
				if (platform.task === 'SG') {
					tx = tx.flat()
				}
				model.init(tx)
				if (platform.task !== 'SG') {
					c.forEach(c => c.remove())
					c = platform.datas.points.map(p => {
						return csvg
							.append('circle')
							.attr('cx', p.at[0])
							.attr('cy', p.at[1])
							.attr('r', model.h)
							.attr('stroke', 'black')
							.attr('fill-opacity', 0)
							.attr('stroke-opacity', 0.5)
					})
				}
				plot()
			})
			elm.select('[name=clusternumber]').text(model.categories)
		})
		.step(cb => {
			if (model === null) {
				return
			}
			model.fit()
			plot()
			elm.select('[name=clusternumber]').text(model.categories)
			cb && cb()
		})
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.on('change', function () {
			model.threshold = d3.select(this).property('value')
			plot()
			elm.select('[name=clusternumber]').text(model.categories)
		})
	elm.append('span').attr('name', 'clusternumber').text('0')
	elm.append('span').text(' clusters ')
	return () => {
		csvg.remove()
		platform.datas.scale = orgScale
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispMeanShift(platform.setting.ml.configElement, platform)
}