import {
	CompleteLinkageHierarchyClustering,
	SingleLinkageHierarchyClustering,
	GroupAverageHierarchyClustering,
	WardsHierarchyClustering,
	CentroidHierarchyClustering,
	WeightedAverageHierarchyClustering,
	MedianHierarchyClustering,
} from '../model/hierarchy.js'

const argmin = function (arr, key) {
	if (arr.length == 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.min(...arr))
}

const argmax = function (arr, key) {
	if (arr.length == 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

var dispHierarchy = function (elm, platform) {
	const svg = platform.svg
	const line = d3
		.line()
		.x(d => d[0])
		.y(d => d[1])

	let clusterClass = null
	let clusterInstance = null
	let clusterPlot = null
	svg.insert('g', ':first-child').attr('class', 'grouping')

	const plotLink = getLinks => {
		let lines = []
		const clusters = elm.select('[name=clusternumber]').property('value')
		let category = 1
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.leafCount() > 1) {
				let lin = []
				h.scan(node => {
					if (node.leafCount() > 1) {
						if (!node.value.line) {
							node.value.line = getLinks(node.at(0), node.at(1))
						}
						lin = lin.concat(node.value.line)
					} else if (node.isLeaf()) {
						platform.datas.at(node.value.index).y = category
					}
				})
				lin = lin.map(l => ({
					path: l.map(p => p.map(v => v / platform.datas.scale)),
					color: getCategoryColor(category),
				}))
				lines = lines.concat(lin)
			} else {
				platform.datas.at(h.value.index).y = category
			}
			category += h.leafCount()
		})
		svg.selectAll('.grouping path').remove()
		svg.select('.grouping')
			.selectAll('path')
			.data(lines)
			.enter()
			.append('path')
			.attr('d', d => line(d.path))
			.attr('stroke', d => d.color)
	}
	const plotConvex = function () {
		svg.selectAll('.grouping polygon').remove()
		const clusters = elm.select('[name=clusternumber]').property('value')
		let category = 1
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.leafCount() > 1) {
				h.scan(node => {
					if (node.value.poly) {
						node.value.poly.remove()
					} else if (node.isLeaf()) {
						platform.datas.at(node.value.index).y = category
					}
				})
				Promise.resolve().then(() => {
					h.value.poly = new DataConvexHull(
						svg.select('.grouping'),
						h.leafs().map(v => platform.datas.points[v.value.index])
					)
				})
			} else {
				platform.datas.at(h.value.index).y = category
			}
			category += h.leafCount()
		})
	}
	elm.append('select')
		.on('change', function () {
			var slct = d3.select(this)
			slct.selectAll('option')
				.filter(d => d.value == slct.property('value'))
				.each(d => (clusterClass = d.class))
				.each(d => (clusterPlot = d.plot))
		})
		.selectAll('option')
		.data([
			{
				value: 'Complete Linkage',
				class: CompleteLinkageHierarchyClustering,
				plot: () => {
					plotLink((h1, h2) => {
						let f1 = h1.leafValues()
						let f2 = h2.leafValues()
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmax(f2, v2 => v1.distances[v2.index])]]
						})
						let target = f1BaseDistance[argmax(f1BaseDistance, v => v[0].distances[v[1].index])]
						return [[target[0].point, target[1].point]]
					})
				},
			},
			{
				value: 'Single Linkage',
				class: SingleLinkageHierarchyClustering,
				plot: () => {
					plotLink((h1, h2) => {
						let f1 = h1.leafValues()
						let f2 = h2.leafValues()
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmin(f2, v2 => v1.distances[v2.index])]]
						})
						let target = f1BaseDistance[argmin(f1BaseDistance, v => v[0].distances[v[1].index])]
						return [[target[0].point, target[1].point]]
					})
				},
			},
			{
				value: 'Group Average',
				class: GroupAverageHierarchyClustering,
				plot: () => plotConvex(),
			},
			{
				value: "Ward's",
				class: WardsHierarchyClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Centroid',
				class: CentroidHierarchyClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Weighted Average',
				class: WeightedAverageHierarchyClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Median',
				class: MedianHierarchyClustering,
				plot: () => plotConvex(),
			},
		])
		.enter()
		.append('option')
		.attr('value', d => d.value)
		.text(d => d.value)
		.each((d, i) => i == 0 && (clusterClass = d.class))
		.each((d, i) => i == 0 && (clusterPlot = d.plot))
	elm.append('select')
		.attr('name', 'metric')
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Initialize')
		.on('click', () => {
			if (clusterClass) {
				const metric = elm.select('[name=metric]').property('value')
				clusterInstance = new clusterClass(metric)
				platform.fit(tx => {
					clusterInstance.fit(tx)
				})
				elm.selectAll('[name^=clusternumber]')
					.attr('max', platform.datas.length)
					.property('value', 10)
					.attr('disabled', null)
				svg.selectAll('path').remove()
				svg.selectAll('.grouping *').remove()
				clusterPlot()
			}
		})

	elm.append('span').text('Cluster #')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'clusternumbeript')
		.attr('min', 1)
		.attr('max', 1)
		.attr('value', 1)
		.attr('disabled', 'disabled')
		.on('change', function () {
			elm.select('[name=clusternumber]').property('value', d3.select(this).property('value'))
			clusterPlot()
		})
	elm.append('input')
		.attr('type', 'range')
		.attr('name', 'clusternumber')
		.attr('min', 1)
		.attr('disabled', 'disabled')
		.on('change', function () {
			elm.select('[name=clusternumbeript]').property('value', d3.select(this).property('value'))
			clusterPlot()
		})
		.on('input', function () {
			elm.select('[name=clusternumbeript]').property('value', d3.select(this).property('value'))
		})
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.'
	dispHierarchy(platform.setting.ml.configElement, platform)
	platform.setting.terminate = () => {
		d3.selectAll('svg .grouping').remove()
	}
}
