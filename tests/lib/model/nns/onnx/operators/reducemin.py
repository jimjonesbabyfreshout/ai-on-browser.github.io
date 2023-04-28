import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, axis, kwargs in [
    ("reducemin", [1], {}),
    ("reducemin_not_keepdims", [1], {"keepdims": 0}),
    ("reducemin_noop_with_empty_axes", [1], {"noop_with_empty_axes": 1}),
]:
    axis_init = onnx.helper.make_tensor(
        name="a",
        data_type=onnx.TensorProto.INT64,
        dims=(len(axis),),
        vals=axis,
    )

    node = onnx.helper.make_node(
        "ReduceMin", inputs=["x", "a"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[axis_init]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")