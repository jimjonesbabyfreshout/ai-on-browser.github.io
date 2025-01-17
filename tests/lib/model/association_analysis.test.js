import AssociationAnalysis from '../../../lib/model/association_analysis.js'

test('items', () => {
	const model = new AssociationAnalysis(0.001)

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
	const items = [...model.items()].flat()
	items.sort()
	expect(items).toEqual(['c', 'data', 'image', 'java', 'net', 'web'])
})

test('items large support', () => {
	const model = new AssociationAnalysis(0.5)

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
	const items = [...model.items()].flat()
	items.sort()
	expect(items).toEqual(['c', 'data', 'image', 'java'])
})

test('support', () => {
	const model = new AssociationAnalysis(0.001)

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
	expect(model.support('data')).toBeCloseTo(4 / 7)
	expect(model.support('data', 'image')).toBeCloseTo(2 / 7)
})

test('confidence', () => {
	const model = new AssociationAnalysis(0.001)

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
	expect(model.confidence('java', 'c')).toBeCloseTo(0.4)
})

test('lift', () => {
	const model = new AssociationAnalysis(0.001)

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
	expect(model.lift('java', 'c')).toBeCloseTo(0.7)
	expect(model.lift('net', 'java')).toBeCloseTo(1.4)
})
