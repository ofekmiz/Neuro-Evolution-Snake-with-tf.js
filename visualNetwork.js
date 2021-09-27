
function drawVisualNetwork(canvas, inputs, outputs, input_labels, output_labels, max_output_index) {

    const INPUT_NODE_RADIUS = 13;
    const INPUT_NODE_SPACING = 32;
    const OUTPUT_NODE_RADIUS = 20;
    const OUTPUT_NODE_SPACING = 50;
    const GREEN_OUTPUT_TRESHOLD = 0.5;
    canvas.width = 320;
    canvas.height = 430;

    /** @type {CanvasRenderingContext2D} */
    var ctx = canvas.getContext("2d");

    //Draw Inputs
    for (var i = 0; i < Snake.INPUT_NODES; i++) {
        var color = inputs[i] == 0 ? "lightgray" : inputs[i] > 0.75 ? "green" : inputs[i] <= 0.5 ? "lightgreen" : inputs[i] <= 0.75 ? "mediumseagreen" : "white";
        var text = parseFloat(inputs[i]).toFixed(2);
        //var text = "";
        drawCircle(ctx, 100, canvas.height / 2 - INPUT_NODE_SPACING * Snake.INPUT_NODES / 2 + INPUT_NODE_SPACING * i, INPUT_NODE_RADIUS, color, text);
        //Draw label
        ctx.beginPath();
        ctx.font = "12px Arial"
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
    var rectText = "Hidden Layer " + "(" + Snake.HIDDEN_NODES +")";
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
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.font = radius >=20 ? "12px Arial" : "10px Arial";
    if (typeof text != "undefined") ctx.fillText(text, center_x, center_y + 3 , radius);
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

function drawGenerationGraph(canvas) {
    canvas.width = 400;
    canvas.height = 430;
    var ctxL = canvas.getContext('2d');
    if (canvas.chart) canvas.chart.destroy();
    var labels = [];
    for (i = 0; i < generationData.score.length; i++) {
        labels.push(i);
    }
    var myChart = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Best Score",
                type: "line",
                borderColor: "green",
                yAxisID: 'y1',
                data: generationData.score,
                fill: false
            }, {
                label: "Best Fitness",
                type: "line",
                borderColor: "blue",
                yAxisID: 'y2',
                data: generationData.fitness,
                fill: false
            }, {
                label: "Avg Score",
                type: "line",
                borderColor: "springgreen",
                yAxisID: 'y1',
                data: generationData.avg_score,
                fill: false,
            },
            {
                label: "Avg Fitness",
                type: "line",
                borderColor: "skyblue",
                yAxisID: 'y2',
                data: generationData.avg_fitness,
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
                    grid: {
                        display: false
                    }
                },
            }
        }
    });
    canvas.chart = myChart;
}
