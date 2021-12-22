import { Matrix } from '../../../lib/util/math.js'
import NAROW from '../../../lib/model/narow.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('fit', () => {
	const model = new NAROW(20)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	model.fit()
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
