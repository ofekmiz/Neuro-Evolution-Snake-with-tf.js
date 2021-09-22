
function drawVisualNetwork(canvas, inputs, outputs, input_labels, output_labels, max_output_index) {

    const INPUT_NODE_RADIUS = 10;
    const INPUT_NODE_SPACING = 25;
    const OUTPUT_NODE_RADIUS = 20;
    const OUTPUT_NODE_SPACING = 50;
    const GREEN_OUTPUT_TRESHOLD = 0.5;
    canvas.width = 320;
    canvas.height = 400;

    /** @type {CanvasRenderingContext2D} */
    var ctx = canvas.getContext("2d");

    //Draw Inputs
    for (var i = 0; i < Snake.INPUT_NODES; i++) {
        var color = inputs[i] == 0 ? "lightgray" : inputs[i] == 1 ? "green" : inputs[i] <= 0.25 ? "lightgreen" : inputs[i] <= 0.5 ? "mediumseagreen" : "black";
        drawCircle(ctx, 100, canvas.height / 2 - INPUT_NODE_SPACING * Snake.INPUT_NODES / 2 + INPUT_NODE_SPACING * i, INPUT_NODE_RADIUS, color);
        //Draw label
        ctx.beginPath();
        ctx.textAlign = "right";
        ctx.fillStyle = input_labels[i].color || "black";
        ctx.fillText(input_labels[i].text || "", 80, canvas.height / 2 - INPUT_NODE_SPACING * Snake.INPUT_NODES / 2 + INPUT_NODE_SPACING * i + INPUT_NODE_RADIUS / 2);
        ctx.closePath();
    }

    //Draw Hidden Layer
    var rect_x = 140;
    var rectY = canvas.height / 2 - INPUT_NODE_SPACING * Snake.INPUT_NODES / 2 - INPUT_NODE_SPACING / 2;
    var rectWidth = 70;
    var rectHeight = INPUT_NODE_SPACING * Snake.INPUT_NODES;
    var rectText = "Hidden Layers " + "(" + Snake.HIDDEN_NODES_1 + "," + Snake.HIDDEN_NODES_2 + ")";
    drawRect(ctx, rect_x, rectY, rectWidth, rectHeight, "gray", rectText);

    //Draw Outputs
    for (var i = 0; i < Snake.OUTPUT_NODES; i++) {
        var color = (i == max_output_index && outputs[i] <= Snake.RANDOM_OUTPUT_TRESHOLD) ? "blue" : (i == max_output_index && outputs[i] < GREEN_OUTPUT_TRESHOLD) ? "lightgreen" : (i == max_output_index) ? "green" : "lightgray";
        drawCircle(ctx, 250, canvas.height / 2 - OUTPUT_NODE_SPACING * Snake.OUTPUT_NODES / 2 + 50 * i, OUTPUT_NODE_RADIUS, color, parseFloat(outputs[i]).toFixed(2));
        //Draw label
        ctx.beginPath();
        ctx.fillStyle = output_labels[i].color || "black";
        ctx.fillText(output_labels[i].text || "", 300, canvas.height / 2 - OUTPUT_NODE_SPACING * Snake.OUTPUT_NODES / 2 + OUTPUT_NODE_SPACING * i);
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

function drawRect(ctx, center_x, center_y, width, height, color, text) {
    ctx.beginPath();
    var textLineSpace = 20;
    ctx.rect(center_x, center_y, width, height);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var words = text.split(" ");
    //center words inside rect
    for (var i = 0; i < words.length; i++) {
        ctx.fillText(words[i], center_x + (width / 2), center_y + (height / 2) - textLineSpace * (words.length / 2 - i), width);
    }
    ctx.stroke();
    ctx.closePath();
}

function drawNetworkGraph(canvas, score_data, fitness_data, avg_data) {
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    var ctxL = canvas.getContext('2d');
    if (canvas.chart) canvas.chart.destroy();
    var labels = [];
    for (i = 0; i < score_data.length; i++) {
        labels.push(i);
    }
    var myChart = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Best Score",
                type: "line",
                borderColor: "#8e5ea2",
                yAxisID: 'y1',
                data: score_data,
                fill: false
            }, {
                label: "Best Fitness",
                type: "line",
                borderColor: "magenta",
                yAxisID: 'y2',
                data: fitness_data,
                fill: false
            }, {
                label: "Avg Score",
                type: "line",
                borderColor: "green",
                yAxisID: 'y1',
                data: avg_data,
                fill: false,
            }]
        },

        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: "Generation"
                    }
                },
                y1: {
                    position: "left",
                    title: {
                        display: true,
                        text: "Score"
                    },
                    ticks: {
                        beginAtZero: true
                    }
                },
                y2: {
                    position: "right",
                    title: {
                        display: true,
                        text: "fitness"
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    grid: {
                        display: false
                    }
                },
            }
        }
    });
    canvas.chart = myChart;
}
