import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import NeighbourhoodComponentsAnalysis from '../../../lib/model/nca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const model = new NeighbourhoodComponentsAnalysis(3)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.2).concat(Matrix.randn(n, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}

	model.fit(x, t)
	const y = model.predict(x)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
