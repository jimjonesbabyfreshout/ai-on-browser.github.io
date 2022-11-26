import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle averagepool operator
 *
 * @module HandleONNXAveragePoolOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#AveragePool
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.NodeProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = {}
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		if (attrs.strides && attrs.strides.some(v => v !== attrs.strides[0])) {
			throw new Error(`Invalid attribute 'strides' value ${attrs.strides}.`)
		}
		if (attrs.auto_pad === 'SAME_UPPER') {
			attrs.pads = attrs.kernel_shape.map(v => Math.ceil((v - 1) / 2))
		} else if (attrs.auto_pad && attrs.auto_pad !== 'NOTSET') {
			throw new Error(`Invalid attribute 'auto_pad' value ${attrs.auto_pad}.`)
		} else if (attrs.pads && attrs.pads.some(v => v !== attrs.pads[0])) {
			throw new Error(`Invalid attribute 'pads' value ${attrs.pads}.`)
		}
		return [
			{
				type: 'average_pool',
				input: [node.inputList[0]],
				name: node.outputList[0],
				kernel: attrs.kernel_shape,
				padding: attrs.pads ? attrs.pads[0] : 0,
				stride: attrs.strides ? attrs.strides[0] : 1,
				channel_dim: 1,
			},
		]
	},
}