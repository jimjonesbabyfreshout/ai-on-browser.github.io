import Matrix from '../../../lib/util/matrix.js'
import WeightedKMeans from '../../../lib/model/weighted_kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new WeightedKMeans(2)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.add(x)
	model.add(x)
	for (let i = 0; i < 20; i++) {
		const d = model.fit(x)
		if (d === 0) {
			break
		}
	}
	expect(model.size).toBe(2)
	expect(model.centroids).toHaveLength(2)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('clear', () => {
	const model = new WeightedKMeans(2)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.add(x)
	model.add(x)
	expect(model.size).toBe(2)
	model.clear()
	expect(model.size).toBe(0)
})

test('predict before fit', () => {
	const model = new WeightedKMeans(2)
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	expect(() => model.predict(x)).toThrow('Call fit before predict.')
})
