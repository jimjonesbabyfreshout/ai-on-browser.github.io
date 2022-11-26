import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle softmax operator
 *
 * @module HandleONNXSoftmaxOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Softmax
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
		return [{ type: 'softmax', input: [node.inputList[0]], name: node.outputList[0] }]
	},
}