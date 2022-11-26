import { onnx } from '../onnx_importer.js'

/**
 * Handle sigmoid operator
 *
 * @module HandleONNXSigmoidOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#sigmoid
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
		return [{ type: 'sigmoid', input: [node.inputList[0]], name: node.outputList[0] }]
	},
}