import { onnx } from '../onnx_importer.js'

/**
 * Handle identity operator
 *
 * @module HandleONNXIdentityOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Identity
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
		return [{ type: 'linear', input: [node.inputList[0]], name: node.outputList[0] }]
	},
}