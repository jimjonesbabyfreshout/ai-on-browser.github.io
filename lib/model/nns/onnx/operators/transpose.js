import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle transpose operator
 *
 * @module HandleONNXTransposeOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#transpose
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
		return [
			{
				type: 'transpose',
				input: [node.inputList[0]],
				name: node.outputList[0],
				axis: attrs.perm,
			},
		]
	},
}