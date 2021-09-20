
class Snake {
    static FULL_LIFE = 100;
    static INPUT_NODES = 12;
    static HIDDEN_NODES = 8;
    static OUTPUT_NODES = 4;
    static RANDOM_OUTPUT_TRESHOLD = 0;
    constructor(brain) {
        this.y = getRandomInt(1, TILE_COUNT - 1);
        this.x = getRandomInt(1, TILE_COUNT - 1);
        this.x_velocity = 0;
        this.y_velocity = 0;
        this.tail_length = 3;
        this.trail = [];
        this.score = 0;
        this.life = Snake.FULL_LIFE;
        this.steps = 0;
        this.hit_wall = false;
        this.fitness = 0;
        if (brain !== "human") {
            if (brain) {
                this.brain = brain.copy();
            } else {
                this.brain = new NeuralNetwork(Snake.INPUT_NODES, Snake.HIDDEN_NODES, Snake.OUTPUT_NODES);
            }
        }
    }

    dispose() {
        this.brain.dispose();
    }

    up() {
        if (this.y_velocity != 1) {
            this.x_velocity = 0;
            this.y_velocity = -1;
        }
    }
    down() {
        if (this.y_velocity != -1) {
            this.x_velocity = 0;
            this.y_velocity = 1;
        }
    }
    left() {
        if (this.x_velocity != 1) {
            this.x_velocity = -1;
            this.y_velocity = 0;
        }
    }
    right() {
        if (this.x_velocity != -1) {
            this.x_velocity = 1;
            this.y_velocity = 0;
        }
    }

    mutate(rate) {
        this.brain.mutate(rate);
    }


    foodDistance() {
        return {
            x: (this.x - apple.x) / TILE_COUNT,
            y: (this.y - apple.y) / TILE_COUNT
        };
    }

    wallDistance() {
        return {
            wall_up: this.y / TILE_COUNT,
            wall_down: (TILE_COUNT - this.y) / TILE_COUNT,
            wall_left: this.x / TILE_COUNT,
            wall_right: (TILE_COUNT - this.x) / TILE_COUNT
        }
    }

    /**@param drawVisualNetwork: boolean */
    think(drawVisualNetwork) {

        const WALL_DISTANCE_FAR = 0.5;
        const WALL_DISTANCE_MEDIUM = 0.3;
        const WALL_DISTANCE_DANGER = 0.1;
        var food = this.foodDistance();
        var wall = this.wallDistance();

        let inputs = [];
        //inputs 1-4: snake direction
        inputs[0] = this.y_velocity > 0 ? 1 : 0; //down
        inputs[1] = this.y_velocity < 0 ? 1 : 0; //up
        inputs[2] = this.x_velocity > 0 ? 1 : 0; //right
        inputs[3] = this.x_velocity < 0 ? 1 : 0; //left

        //inputs 5-8: relative distance from food
        inputs[4] = food.x > 0 && food.y == 0 ? 1 : 0; //left
        inputs[5] = food.x < 0 && food.y == 0 ? 1 : 0; //right
        inputs[6] = food.y > 0 && food.x == 0 ? 1 : 0; //up
        inputs[7] = food.y < 0 && food.x == 0 ? 1 : 0; //down

        //inputs 9-12: relative distance from walls

        inputs[8] = wall.wall_up < WALL_DISTANCE_DANGER ? 1 : wall.wall_up < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_up < WALL_DISTANCE_FAR ? 0.25 : 0; //up
        inputs[9] = wall.wall_down < WALL_DISTANCE_DANGER ? 1 : wall.wall_down < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_down < WALL_DISTANCE_FAR ? 0.25 : 0; //down
        inputs[10] = wall.wall_left < WALL_DISTANCE_DANGER ? 1 : wall.wall_left < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_left < WALL_DISTANCE_FAR ? 0.25 : 0; //left
        inputs[11] = wall.wall_right < WALL_DISTANCE_DANGER ? 1 : wall.wall_right < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_right < WALL_DISTANCE_FAR ? 0.25 : 0; //right

        //predict next move according to outputs
        let output = this.brain.predict(inputs);
        let max_output_index = output.indexOf(Math.max(output[0], output[1], output[2], output[3]));
        max_output_index = output[max_output_index] < Snake.RANDOM_OUTPUT_TRESHOLD ? getRandomInt(0, 3) : max_output_index;

        if (max_output_index == 0) {
            this.up();
        } else if (max_output_index == 1) {
            this.down();
        } else if (max_output_index == 2) {
            this.left();
        } else {
            this.right();
        }

        if (drawVisualNetwork) {
            this.drawVisualBrainNetwork(document.getElementById("visual_network"), inputs, output, max_output_index);
        }
    }

    update() {
        this.life--;
        this.steps++;
    }

    drawVisualBrainNetwork(canvas, inputs, outputs, max_output_index) {
        const CANVAS_SIZE = 400;
        const NODE_RADIUS = 10;
        const NODE_SPACING = 25;
        const OUTPUT_LABELS = ["Up", "Down", "Left", "Right"];
        const INPUT_LABELS = ["direction down", "direction up", "direction right", "direction left", "apple left", "apple right", "apple up", "apple down", "wall up", "wall down", "wall left", "wall right"];
        canvas.height = CANVAS_SIZE;
        canvas.width = CANVAS_SIZE;
        /** @type {CanvasRenderingContext2D} */
        var ctx = canvas.getContext("2d");

        function drawCircle(center_x, center_y, radius, color, text) {
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

        //Draw Inputs
        for (var i = 0; i < Snake.INPUT_NODES; i++) {
            var color = inputs[i] == 1 ? "green" : inputs[i] == 0.5 ? "mediumseagreen" : inputs[i] == 0.25 ? "lightgreen" : "gray";
            drawCircle(100, CANVAS_SIZE / 2 - NODE_SPACING * Snake.INPUT_NODES / 2 + NODE_SPACING * i, NODE_RADIUS, color);
            //Draw label
            ctx.beginPath();
            ctx.textAlign = "right";
            ctx.fillStyle = (i < 4) ? "blue" : (i < 8) ? "olive" : ("darkred");
            ctx.fillText(INPUT_LABELS[i], 80, CANVAS_SIZE / 2 - NODE_SPACING * Snake.INPUT_NODES / 2 + NODE_SPACING * i + NODE_RADIUS / 2);
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
        ctx.fillText("(" + Snake.HIDDEN_NODES + ")", rectX + (rectWidth / 2), rectY + (rectHeight / 2) + + textLineSpace, rectWidth);
        ctx.stroke();
        ctx.closePath();

        //Draw Outputs
        for (var i = 0; i < Snake.OUTPUT_NODES; i++) {
            var color = (i == max_output_index && outputs[i] <= Snake.RANDOM_OUTPUT_TRESHOLD) ? "blue" : (i == max_output_index && outputs[i] < 0.7) ? "lightgreen" : (i == max_output_index) ? "green" : "gray";
            drawCircle(250, CANVAS_SIZE / 2 - NODE_SPACING * 2 * Snake.OUTPUT_NODES / 2 + NODE_SPACING * 2 * i, NODE_RADIUS * 2, color, parseFloat(outputs[i]).toFixed(2));
            //Draw label
            ctx.beginPath();
            ctx.fillText(OUTPUT_LABELS[i], 300, CANVAS_SIZE / 2 - NODE_SPACING * 2 * Snake.OUTPUT_NODES / 2 + NODE_SPACING * 2 * i);
            ctx.closePath();
        }

    }
}