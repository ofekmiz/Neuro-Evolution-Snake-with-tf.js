const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

let total_snakes_in_generation = 30;
let human_player = false;
let walls = false;

/** @type {Array.<Snake>} */
let snakes = [];
let current_snake;
let savedSnakes = [];
let canvas;
/** @type {CanvasRenderingContext2D} */
let ctx;
let rate_slider;
let game_loop_interval;
let apple;
let best_score = 0;
let games = 0;
let generation = 0;
let autosave;

//SETUP
window.onload = function () {
    setup();
    newGame();
}

function setup(brain) {
    rate_slider = document.getElementById("game_rate");
    canvas = document.getElementById("snake_game");
    autosave = document.getElementById("autosave");
    canvas.height = CANVAS_SIZE;
    canvas.width = CANVAS_SIZE;
    ctx = canvas.getContext("2d");
    document.addEventListener("keydown", keyDown);
    if (human_player) {
        snakes[0] = new Snake("human");
    } else {
        for (let i = 0; i < total_snakes_in_generation; i++) {
            if (brain) {
                snakes[i] = new Snake(brain);
            } else {
                snakes[i] = new Snake();
            }
        }
    }
    updateGameRate(rate_slider.value);
}

function newGame() {
    apple = { x: 14, y: 15 };
    if (human_player) {
        snakes[0] = new Snake("human");
    }
}

function resetGame(human) {
    human_player = human;
    rate_slider.value = 18;
    setup();
    newGame();
}

//GAME LOOP
function gameLoop() {

    current_snake = snakes[0];
    let hit_wall = false;
    document.getElementById("life").innerHTML = current_snake.life;
    document.getElementById("score").innerHTML = current_snake.score;
    document.getElementById("best_score").innerHTML = best_score;
    document.getElementById("games").innerHTML = games;
    document.getElementById("generation").innerHTML = generation;
    document.getElementById("next_generation").innerHTML = total_snakes_in_generation - savedSnakes.length;

    current_snake.x += current_snake.x_velocity;
    current_snake.y += current_snake.y_velocity;

    if (current_snake.x < 0) {
        if (walls) {
            hit_wall = true;
        } else {
            current_snake.x = TILE_COUNT - 1;
        }
        current_snake.wall_hits++;
    }

    if (current_snake.x > TILE_COUNT - 1) {
        if (walls) {
            hit_wall = true;
        } else {
            current_snake.x = 0;
        }
        current_snake.wall_hits++;
    }
    if (current_snake.y < 0) {
        if (walls) {
            hit_wall = true;
        } else {
            current_snake.y = TILE_COUNT - 1;
        }
    }

    if (current_snake.y > TILE_COUNT - 1) {
        if (walls) {
            hit_wall = true;
        } else {
            current_snake.y = 0;
        }
        current_snake.wall_hits++;
    }

    //Draw black board
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw snake tail
    ctx.fillStyle = "lime";
    for (var i = 0; i < current_snake.trail.length; i++) {
        ctx.fillRect(current_snake.trail[i].x * GRID_SIZE, current_snake.trail[i].y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

        //End Game
        if (hit_wall || (current_snake.life <= 0 && !human_player) || (current_snake.trail[i].x == current_snake.x && current_snake.trail[i].y == current_snake.y && (current_snake.x_velocity != 0 || current_snake.y_velocity != 0))) {

            if (current_snake.score > best_score) {
                best_score = current_snake.score;
                if (!human_player && autosave.checked) downloadBrainFiles(current_snake, 'snake_gen_' + generation + '_score_' + current_snake.score + '_walls_' + walls);
            }

            if (!human_player) {
                savedSnakes.push(snakes.splice(0, 1)[0]); //splice for deep copy
                //Next Generation
                if (savedSnakes.length == total_snakes_in_generation) {
                    generation++;
                    nextGeneration();
                }
            }

            games++;
            //Draw black board
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            newGame();
            return;
        }
    }

    current_snake.trail.push({
        x: current_snake.x,
        y: current_snake.y
    });

    while (current_snake.trail.length > current_snake.tail_length) {
        current_snake.trail.shift();
    }

    //Eat Apple
    if (apple.x == current_snake.x && apple.y == current_snake.y) {
        current_snake.tail_length++;
        current_snake.score++;
        current_snake.life = Snake.FULL_LIFE;
        current_snake.hit_wall = 0;
        apple.x = Math.floor(Math.random() * TILE_COUNT);
        apple.y = Math.floor(Math.random() * TILE_COUNT);
    }

    //draw new apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x * GRID_SIZE, apple.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    if (!human_player) {
        current_snake.think();
        current_snake.update();
    }
}

function keyDown(e) {
    if (human_player) {
        if (e.keyCode == '38') {
            // up arrow
            snakes[0].up();
        }
        else if (e.keyCode == '40') {
            // down arrow
            snakes[0].down();
        }
        else if (e.keyCode == '37') {
            // left arrow
            snakes[0].left();
        }
        else if (e.keyCode == '39') {
            // right arrow
            snakes[0].right();
        }
    } else if (e.keyCode == '83') {
        // pressd 'S'
        downloadBrainFiles(current_snake, 'snake_gen_' + generation + '_score_' + current_snake.score + '_walls_' + walls);
    }
}

function updateGameRate(rate) {
    if (typeof game_loop_interval !== 'undefined') clearInterval(game_loop_interval);
    if (rate > 0) game_loop_interval = setInterval(gameLoop, 1000 / rate);
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    result = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
    console.log(result);
    return result;
}

async function downloadBrainFiles(snake, fileName) {
    await snake.brain.model.save('downloads://' + fileName);
}

async function loadBrainFiles() {
    const jsonUpload = document.getElementById('upload-json'); //json file
    const weightsUpload = document.getElementById('upload-weights'); //bin file
    try {
        const model = await tf.loadLayersModel(
            tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
        let brain = new NeuralNetwork(model, Snake.INPUT_NODES, Snake.HIDDEN_NODES, Snake.OUTPUT_NODES);
        setup(brain);
        newGame();
    } catch (error) {
        console.log("Brain files Not supported, please use the right json & bin files");
    }
}



