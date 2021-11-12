import { Matrix } from '../../../lib/util/math.js'
import MixtureDiscriminant from '../../../lib/model/mda.js'

test('predict', () => {
	const model = new MixtureDiscriminant(5)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50)
	}

	model.init(x, t)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})