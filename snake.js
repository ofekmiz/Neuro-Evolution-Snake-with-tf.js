
class Snake {
    static FULL_LIFE = 300;
    static INPUT_NODES = 12;
    static HIDDEN_NODES = 120;
    static OUTPUT_NODES = 4;
    constructor(brain) {
        this.y = 5;
        this.x = 5;
        this.x_velocity = 0;
        this.y_velocity = 0;
        this.tail_length = 5;
        this.trail = [];
        this.score = 0;
        this.wall_hits = 0;
        this.life = Snake.FULL_LIFE;
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

    mutate() {
        this.brain.mutate(0.1);
    }

    isDirection(dir) {
        let result = false;
        if (dir === "up") result = this.y_velocity === -1;
        if (dir === "down") result = this.y_velocity === 1;
        if (dir === "left") result = this.x_velocity === -1;
        if (dir === "right") result = this.x_velocity === 1;
        return result ? 1 : 0;
    }

    isFood(dir) {
        let result = false;
        if (dir === "up") result = this.y < apple.y;
        if (dir === "down") result = this.y > apple.y;
        if (dir === "left") result = this.x < apple.x;
        if (dir === "right") result = this.x > apple.x;
        return result ? 1 : 0;
    }

    isWall(dir) {
        let result = false;
        if (dir === "up") result = this.y * GRID_SIZE > CANVAS_SIZE - GRID_SIZE * 2;
        if (dir === "down") result = this.y * GRID_SIZE < GRID_SIZE * 2;
        if (dir === "left") result = this.x * GRID_SIZE > CANVAS_SIZE - GRID_SIZE * 2;
        if (dir === "right") this.x * GRID_SIZE > CANVAS_SIZE - GRID_SIZE * 2;
        return result ? 1 : 0;
    }

    think() {
        //console.log(this.isWall("up"), this.isWall("down"), this.isWall("left"), this.isWall("right"));
        let inputs = [];
        inputs[0] = this.isDirection("up")
        inputs[1] = this.isDirection("down");
        inputs[2] = this.isDirection("left");
        inputs[3] = this.isDirection("right");
        inputs[4] = this.isFood("up");
        inputs[5] = this.isFood("down");
        inputs[6] = this.isFood("left");
        inputs[7] = this.isFood("right");
        inputs[8] = this.isWall("up");
        inputs[9] = this.isWall("down");
        inputs[10] = this.isWall("left");
        inputs[11] = this.isWall("right");


        let output = this.brain.predict(inputs);
        let max_output_index = output.indexOf(Math.max(output[0], output[1], output[2], output[3]));
        if (max_output_index == 0) {
            this.up();
        } else if (max_output_index == 1) {
            this.down();
        } else if (max_output_index == 2) {
            this.left();
        } else {
            this.right();
        }
    }

    update() {
        this.life--;
    }
}