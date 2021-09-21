
function drawVisualNetwork(canvas, inputs, outputs, input_labels, output_labels, max_output_index) {
    const CANVAS_SIZE = 400;
    const NODE_RADIUS = 10;
    const NODE_SPACING = 25;
    canvas.height = CANVAS_SIZE;
    canvas.width = CANVAS_SIZE;
    /** @type {CanvasRenderingContext2D} */
    var ctx = canvas.getContext("2d");

    //Draw Inputs
    for (var i = 0; i < Snake.INPUT_NODES; i++) {
        var color = inputs[i] == 1 ? "green" : inputs[i] == 0.5 ? "mediumseagreen" : inputs[i] == 0.25 ? "lightgreen" : "gray";
        drawCircle(ctx, 100, CANVAS_SIZE / 2 - NODE_SPACING * Snake.INPUT_NODES / 2 + NODE_SPACING * i, NODE_RADIUS, color);
        //Draw label
        ctx.beginPath();
        ctx.textAlign = "right";
        ctx.fillStyle = (i < 4) ? "blue" : (i < 8) ? "olive" : ("darkred");
        ctx.fillText(input_labels[i], 80, CANVAS_SIZE / 2 - NODE_SPACING * Snake.INPUT_NODES / 2 + NODE_SPACING * i + NODE_RADIUS / 2);
        ctx.closePath();
    }

    //Draw Hidden Layer
    ctx.beginPath();
    var rectWidth = 70
    var rectY = CANVAS_SIZE / 2 - NODE_SPACING * Snake.INPUT_NODES / 2 - NODE_SPACING / 2;
    var rectX = 140;
    var rectHeight = NODE_SPACING * Snake.INPUT_NODES;
    var textLineSpace = 20;
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = "gray"
    ctx.strokeStyle = "gray"
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Hidden", rectX + (rectWidth / 2), rectY + (rectHeight / 2) - textLineSpace, rectWidth);
    ctx.fillText("Layer", rectX + (rectWidth / 2), rectY + (rectHeight / 2), rectWidth);
    ctx.fillText("(" + Snake.HIDDEN_NODES_1 + "," + Snake.HIDDEN_NODES_2 + ")", rectX + (rectWidth / 2), rectY + (rectHeight / 2) + + textLineSpace, rectWidth);
    ctx.stroke();
    ctx.closePath();

    //Draw Outputs
    for (var i = 0; i < Snake.OUTPUT_NODES; i++) {
        var color = (i == max_output_index && outputs[i] <= Snake.RANDOM_OUTPUT_TRESHOLD) ? "blue" : (i == max_output_index && outputs[i] < 0.7) ? "lightgreen" : (i == max_output_index) ? "green" : "gray";
        drawCircle(ctx, 250, CANVAS_SIZE / 2 - NODE_SPACING * 2 * Snake.OUTPUT_NODES / 2 + NODE_SPACING * 2 * i, NODE_RADIUS * 2, color, parseFloat(outputs[i]).toFixed(2));
        //Draw label
        ctx.beginPath();
        ctx.fillText(output_labels[i], 300, CANVAS_SIZE / 2 - NODE_SPACING * 2 * Snake.OUTPUT_NODES / 2 + NODE_SPACING * 2 * i);
        ctx.closePath();
    }

}

function drawCircle(ctx, center_x, center_y, radius, color, text) {
    ctx.beginPath();
    ctx.strokeStyle = "black"
    ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    if (typeof text != "undefined") ctx.fillText(text, center_x, center_y + 2, radius * 2);
    ctx.closePath();
}