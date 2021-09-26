const CANVAS_SIZE = 400; //size of canvas in px
const TILE_SIZE = 20; //size of each tile in px
const TILE_COUNT = CANVAS_SIZE / TILE_SIZE; //number of tiles in each row
const INITIAL_RATE = 12;

//switch to graph view and back to network on next generation for x seconds(good for recording)
const SWITCH_VIEWS_SECONDS = 5; //set 0 to disable

let canvas;
/** @type {CanvasRenderingContext2D} */
let ctx;
let rate_slider;
let total_snakes_input;
let mutate_rate_input;
let crossover_rate_input;
let graph_canvas;
let visual_network_canvas;

let human_player = false;
let walls = true;

/** @type {Array.<Snake>} */
let snakes = [];
let savedSnakes = [];
let current_snake;
let total_snakes_in_generation = 800;
let game_loop_interval;
let apple;
let best_score;
let games;
let generation;
let autosave;
let autosave2;
let generationData;


//PAGE LOAD SETUP
window.onload = function () {
    total_snakes_input = document.getElementById("total_snakes");
    total_snakes_input.value = total_snakes_in_generation;
    graph_canvas = document.getElementById("lineChart");
    visual_network_canvas = document.getElementById("visual_network");
    rate_slider = document.getElementById("game_rate");
    canvas = document.getElementById("snake_game");
    autosave = document.getElementById("autosave");
    autosave2 = document.getElementById("autosave2");
    canvas.height = CANVAS_SIZE;
    canvas.width = CANVAS_SIZE;
    ctx = canvas.getContext("2d");
    document.addEventListener("keydown", keyDown);
    mutate_rate_input = document.getElementById("mutate_rate");
    crossover_rate_input = document.getElementById("crossover_rate");
    mutate_rate_input.value = Snake.MUTATE_RATE;
    crossover_rate_input.value = Snake.CROSSOVER_RATE;

    setup();
    newGame();
    loadTrainedBrain();
}

//RESET GAME SETUP
function setup(brain) {
    best_score = 0;
    games = 0;
    generation = 0;
    generationData = { score: [], fitness: [], avg_score: [], avg_fitness: [] };
    drawGenerationGraph(graph_canvas);
    showVisualNetwork();

    //Dispose old snakes
    disposeSavedSnakes();
    disposePlayingSnakes();

    //human player
    if (human_player) {
        snakes[0] = new Snake("human");
        document.getElementById("visual_data").classList.add("hidden");
        document.activeElement.blur();
    }
    //AI
    else {
        total_snakes_in_generation = total_snakes_input.value;
        Snake.MUTATE_RATE = mutate_rate_input.value;
        Snake.CROSSOVER_RATE = crossover_rate_input.value;
        document.getElementById("current_mutate_rate").innerHTML = Snake.MUTATE_RATE;
        document.getElementById("current_crossover_rate").innerHTML = Snake.CROSSOVER_RATE;
        document.getElementById("visual_data").classList.remove("hidden");

        //New Snakes population
        for (let i = 0; i < total_snakes_in_generation; i++) {
            if (brain) {
                snakes[i] = new Snake(brain);
            } else {
                snakes[i] = new Snake();
            }
        }
    }

    resetRate(INITIAL_RATE);
}

//Next Snake game in Game Loop
function newGame() {
    if (human_player) {
        snakes[0] = new Snake("human");
    }
    current_snake = snakes[0];
    toggleWalls();
    appleRandomPosition();
}

//Create New Apple position
function appleRandomPosition() {
    let apple_x = getRandomInt(1, TILE_COUNT - 1);
    let apple_y = getRandomInt(1, TILE_COUNT - 1);
    while (apple_x == current_snake.x && apple_y == current_snake.y) {
        apple_x = getRandomInt(1, TILE_COUNT - 1);
        apple_y = getRandomInt(1, TILE_COUNT - 1);
    }
    apple = { x: apple_x, y: apple_y };
}

//GAME LOOP
function gameLoop() {

    let hit_wall = false;
    document.getElementById("life").innerHTML = current_snake.life;
    document.getElementById("score").innerHTML = current_snake.score;
    document.getElementById("best_score").innerHTML = best_score;
    document.getElementById("games").innerHTML = games;
    document.getElementById("generation").innerHTML = generation;
    document.getElementById("next_generation").innerHTML = total_snakes_in_generation - savedSnakes.length;

    current_snake.x += current_snake.x_velocity;
    current_snake.y += current_snake.y_velocity;

    //Hit walls
    if (current_snake.x < 0) {
        if (walls) {
            hit_wall = true;
            current_snake.hit_wall = true;
        } else {
            current_snake.x = TILE_COUNT - 1;
        }
    }

    if (current_snake.x > TILE_COUNT - 1) {
        if (walls) {
            hit_wall = true;
            current_snake.hit_wall = true;
        } else {
            current_snake.x = 0;
        }
    }
    if (current_snake.y < 0) {
        if (walls) {
            hit_wall = true;
            current_snake.hit_wall = true;
        } else {
            current_snake.y = TILE_COUNT - 1;
        }
    }

    if (current_snake.y > TILE_COUNT - 1) {
        if (walls) {
            hit_wall = true;
            current_snake.hit_wall = true;
        } else {
            current_snake.y = 0;
        }
    }

    //Draw black board
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw snake tail
    ctx.fillStyle = "lime";
    for (var i = 0; i < current_snake.trail.length; i++) {
        ctx.fillRect(current_snake.trail[i].x * TILE_SIZE, current_snake.trail[i].y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);

        //End Game
        if (hit_wall || (current_snake.life <= 0 && !human_player) || (current_snake.trail[i].x == current_snake.x && current_snake.trail[i].y == current_snake.y && (current_snake.x_velocity != 0 || current_snake.y_velocity != 0))) {

            if (current_snake.score > best_score) {
                best_score = current_snake.score;
                if (!human_player && autosave.checked) downloadCurrentBrain();
            }

            if (!human_player) {
                savedSnakes.push(snakes.splice(0, 1)[0]); //remove the current snake from snakes and put it in savedSnakes
                //Next Generation
                if (savedSnakes.length == total_snakes_in_generation) {
                    generation++;
                    updateGameRate(rate_slider.value);
                    nextGeneration();
                    switchViews();
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
    ctx.fillRect(apple.x * TILE_SIZE, apple.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
    if (!human_player) {
        current_snake.think(true);
        current_snake.update();
    }
}

//-------------------Game Control----------------------

function keyDown(e) {
    if (human_player && document.activeElement === document.body) {
        e.preventDefault(); //prevent scroll with arrows
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
    } else if (document.activeElement === document.body) {
        if (e.keyCode == '83') {
            // pressd 'S'
            downloadCurrentBrain();
        }
    }
}
function resetGame(human) {
    human_player = human;
    setup();
    newGame();
}

function resetRate(rate) {
    rate_slider.value = rate;
    updateGameRate(rate);
}

function updateGameRate(rate) {
    if (typeof game_loop_interval !== 'undefined') clearInterval(game_loop_interval);
    if (rate > 0) {
        setTimeout(function () { game_loop_interval = setInterval(gameLoop, 1000 / rate); }, 300);
    }
}

function toggleWalls() {
    var walls_check = document.getElementById("enable_walls").checked;
    if (walls_check) {
        walls = true;
        canvas.classList.add("walls");
    } else {
        walls = false;
        canvas.classList.remove("walls");
    }
}

//-------------------TensorFlow File system----------------------

function downloadCurrentBrain() {
    downloadBrainFiles(current_snake, 'snake_gen_' + generation + '_score_' + current_snake.score + '_walls_' + walls);
}

async function downloadBrainFiles(snake, fileName) {
    var fileMark = document.getElementById("file_mark").value;
    fileMark = fileMark ? fileMark + "_" : "";
    var today = new Date();
    var time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
    await snake.brain.model.save('downloads://' + fileMark + fileName + "(" + time + ")(" + date + ")");
}

async function loadBrainFiles() {
    const jsonUpload = document.getElementById('upload-json'); //json file
    const weightsUpload = document.getElementById('upload-weights'); //bin file
    try {
        const model = await tf.loadLayersModel(
            tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
        let brain = new NeuralNetwork(model, Snake.INPUT_NODES, Snake.HIDDEN_NODES, Snake.OUTPUT_NODES);
        human_player = false;
        setup(brain);
        newGame();
    } catch (error) {
        console.log(error);
        alert("Couldn't load files");
    }
}

async function loadTrainedBrain() {
    try {
        const model = await tf.loadLayersModel('https://ofekmiz.github.io/Neuro-Evolution-Snake-with-tf.js/snake_brains/record4_snake_gen_30_score_37_walls_true(0_39_16)(2021_9_26).json');
        let brain = new NeuralNetwork(model, Snake.INPUT_NODES, Snake.HIDDEN_NODES, Snake.OUTPUT_NODES);
        setup(brain);
        newGame();
        generation = 30;
    } catch (error) {
        console.log(error);
    }
}

//-------------------Visual Network and Data Utilities----------------------

function showVisualNetwork() {
    var buttons = document.querySelectorAll('.visual_data_menu button');
    buttons.forEach(element => element.classList.remove("chosen"));
    buttons[0].classList.add("chosen");
    visual_network_canvas.classList.remove("hidden");
    graph_canvas.classList.add("hidden");
}

function showGraph() {
    var buttons = document.querySelectorAll('.visual_data_menu button');
    buttons.forEach(element => element.classList.remove("chosen"));
    buttons[1].classList.add("chosen");
    visual_network_canvas.classList.add("hidden");
    graph_canvas.classList.remove("hidden");
}

function switchViews() {
    if (SWITCH_VIEWS_SECONDS > 0 && graph_canvas.classList.contains("hidden")) {
        showGraph();
        setTimeout(showVisualNetwork, SWITCH_VIEWS_SECONDS * 1000);
    }
}



//-------------------General Utilities----------------------
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    result = {
        x: ((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width) / TILE_COUNT,
        y: ((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height) / TILE_COUNT
    };
    console.log(result);
    return result;
}

function imposeMinMax(el) {
    if (el.value != "") {
        if (parseInt(el.value) < parseInt(el.min)) {
            el.value = el.min;
        }
        if (parseInt(el.value) > parseInt(el.max)) {
            el.value = el.max;
        }
    }
}
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// "times" is the number of times random is summed and should be over >= 1 (default is 6 if not defined)
// return a random number between 0-1 exclusive
//https://riptutorial.com/javascript/example/8330/random--with-gaussian-distribution
function randomGaussian(times) {
    var v = times || 6;
    var r = 0;
    for (var i = v; i > 0; i--) {
        r += Math.random();
    }
    return r / v;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


