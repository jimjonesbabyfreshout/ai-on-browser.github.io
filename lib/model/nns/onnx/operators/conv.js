import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

import Tensor from '../../../../util/tensor.js'

/**
 * Handle conv operator
 *
 * @module HandleONNXConvOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#conv
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
		const initializers = {}
		let kernelSize = null
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.w = Tensor.fromArray(loadTensor(initializer))
				kernelSize = initializers.w.sizes
				initializers.w = initializers.w.transpose(1, 2, 3, 0).toArray()
			} else if (initializer.name === node.inputList[2]) {
				initializers.b = loadTensor(initializer)
			}
		}
		if (attrs.group && attrs.group !== 1) {
			throw new Error(`Invalid attribute 'group' value ${attrs.group}.`)
		}
		if (attrs.pads && attrs.pads.some(v => v !== attrs.pads[0])) {
			throw new Error(`Invalid attribute 'pads' value ${attrs.pads}.`)
		}
		if (attrs.strides && attrs.strides.some(v => v !== attrs.strides[0])) {
			throw new Error(`Invalid attribute 'strides' value ${attrs.strides}.`)
		}
		if (attrs.auto_pad === 'SAME_UPPER') {
			attrs.pads = attrs.kernel_shape.map(v => Math.ceil((v - 1) / 2))
		} else if (attrs.auto_pad && attrs.auto_pad !== 'NOTSET') {
			throw new Error(`Invalid attribute 'auto_pad' value ${attrs.auto_pad}.`)
		}
		return [
			{
				type: 'conv',
				input: [node.inputList[0]],
				name: node.outputList[0],
				kernel: kernelSize.slice(2),
				channel: kernelSize[0],
				padding: attrs.pads ? attrs.pads[0] : null,
				stride: attrs.strides ? attrs.strides[0] : null,
				w: initializers.w,
				channel_dim: 1,
			},
		]
	},
}