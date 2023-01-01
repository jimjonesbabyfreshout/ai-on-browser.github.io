import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('softmax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/softmax.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('SoftmaxLayer')
		const x = Matrix.randn(20, 3)
		const sm = Matrix.map(x, Math.exp)
		sm.div(sm.sum(1))

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(sm.at(i, j))
			}
		}
	})

	test('softmax_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/softmax_axis_2.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'axis' value 2."))
	})
})
