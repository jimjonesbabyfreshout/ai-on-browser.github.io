import RadialBasisFunctionNetwork from '../model/rbf.js'

var dispRBF = function (elm, platform) {
	const calcRBF = function () {
		const rbf = elm.select('[name=rbf]').property('value')
		const l = +elm.select('[name=l]').property('value')
		const e = +elm.select('[name=e]').property('value')
		platform.fit((tx, ty) => {
			let model = new RadialBasisFunctionNetwork(rbf, e, l)
			model.fit(tx, ty)
			platform.predict((px, cb) => {
				const pred = model.predict(px)
				cb(pred)
			}, 4)
		})
	}

	elm.append('span').text('RBF ')
	elm.append('select')
		.attr('name', 'rbf')
		.selectAll('option')
		.data(['linear', 'gaussian', 'multiquadric', 'inverse quadratic', 'inverse multiquadric', 'thin plate', 'bump'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' e = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	if (platform.task === 'IN') {
		elm.append('input').attr('type', 'hidden').attr('name', 'l').attr('value', 0)
	} else {
		elm.append('span').text(' l = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'l')
			.attr('value', 0.1)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.1)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcRBF)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRBF(platform.setting.ml.configElement, platform)
}