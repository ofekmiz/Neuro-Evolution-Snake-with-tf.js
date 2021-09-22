
class Snake {
    static FULL_LIFE = 150;
    static INPUT_NODES = 12;
    static HIDDEN_NODES_1 = 12;
    static HIDDEN_NODES_2 = 9;
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
                this.brain = new NeuralNetwork(Snake.INPUT_NODES, Snake.HIDDEN_NODES_1, Snake.HIDDEN_NODES_2, Snake.OUTPUT_NODES);
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

    think(drawVisualNetwork) {

        const WALL_DISTANCE_FAR = 0.5;
        const WALL_DISTANCE_MEDIUM = 0.3;
        const WALL_DISTANCE_DANGER = 0.1;
        var food = this.foodDistance();
        var wall = this.wallDistance();

        let inputs = [];
        //inputs 1-4: snake direction
        inputs[0] = this.y_velocity < 0 ? 1 : 0; //up
        inputs[1] = this.y_velocity > 0 ? 1 : 0; //down
        inputs[2] = this.x_velocity < 0 ? 1 : 0; //left
        inputs[3] = this.x_velocity > 0 ? 1 : 0; //right

        //inputs 5-8: relative distance from food
        inputs[4] = food.y > 0 && food.x == 0 ? 1 : 0; //up
        inputs[5] = food.y < 0 && food.x == 0 ? 1 : 0; //down
        inputs[6] = food.x > 0 && food.y == 0 ? 1 : 0; //left
        inputs[7] = food.x < 0 && food.y == 0 ? 1 : 0; //right

        //inputs 9-12: relative distance from walls
        inputs[8] = wall.wall_up < WALL_DISTANCE_DANGER ? 1 : wall.wall_up < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_up < WALL_DISTANCE_FAR ? 0.25 : 0;
        inputs[9] = wall.wall_down < WALL_DISTANCE_DANGER ? 1 : wall.wall_down < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_down < WALL_DISTANCE_FAR ? 0.25 : 0;
        inputs[10] = wall.wall_left < WALL_DISTANCE_DANGER ? 1 : wall.wall_left < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_left < WALL_DISTANCE_FAR ? 0.25 : 0;
        inputs[11] = wall.wall_right < WALL_DISTANCE_DANGER ? 1 : wall.wall_right < WALL_DISTANCE_MEDIUM ? 0.5 : wall.wall_right < WALL_DISTANCE_FAR ? 0.25 : 0;

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

        //Draw visual network
        if (drawVisualNetwork) this.displayVisualBrainNetwork(inputs, output, max_output_index);
    }

    displayVisualBrainNetwork(inputs, output, max_output_index) {
        const OUTPUT_LABELS = [
            { text: "Up" },
            { text: "Down" },
            { text: "Left" },
            { text: "Right" }];
        const INPUT_LABELS = [
            { text: "Direction up", color: "blue" },
            { text: "Direction down", color: "blue" },
            { text: "Direction left", color: "blue" },
            { text: "Direction right", color: "blue" },
            { text: "Apple up", color: "red" },
            { text: "Apple down", color: "red" },
            { text: "Apple left", color: "red" },
            { text: "Apple right", color: "red" },
            { text: "wall up", color: "gray" },
            { text: "wall down", color: "gray" },
            { text: "wall left", color: "gray" },
            { text: "wall right", color: "gray" }];
        drawVisualNetwork(visual_network_canvas, inputs, output, INPUT_LABELS, OUTPUT_LABELS, max_output_index);
    }

    update() {
        this.life--;
        this.steps++;
    }
}