import Matrix from '../../../lib/util/matrix.js'
import DBSCAN from '../../../lib/model/dbscan.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test.each([undefined, 'euclid', 'manhattan', 'chebyshev'])('clustering %s', metric => {
	const model = new DBSCAN(undefined, undefined, metric)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
