import { Matrix } from '../../../lib/util/math.js'
import LeastTrimmedSquaresRegression from '../../../lib/model/lts.js'

test('default', () => {
	const model = new LeastTrimmedSquaresRegression()
})

test('fit', () => {
	const model = new LeastTrimmedSquaresRegression()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i][0] - t[i][0]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})