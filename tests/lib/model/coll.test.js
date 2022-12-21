import Matrix from '../../../lib/util/matrix.js'
import COLL from '../../../lib/model/coll.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('cast', () => {
	const model = new COLL(3)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.init(x)
	const first_err = model.fit()
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const last_err = model.fit()
	expect(last_err).toBeLessThan(first_err)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})