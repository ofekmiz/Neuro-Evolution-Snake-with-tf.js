// Neuro-Evolution Snake

function nextGeneration() {

  calculateFitness();
  let numOfBestSnakes = Math.floor(savedSnakes.length / 2);

  //New snakes population
  disposePlayingSnakes();
  for (let i = numOfBestSnakes; i < total_snakes_in_generation; i++) {
    snakes[i] = pickOne(savedSnakes);
    if (Math.random(1) < Snake.CROSSOVER_RATE) {
      snakes[i].crossover(pickOne(savedSnakes));
    }
    snakes[i].mutate();
  }

  //Add the best snakes to next generation
  savedSnakes.sort(compareSnakeFitness); //saved sankes is sorted best to worst after this
  for (let i = 0; i < numOfBestSnakes; i++) {
    snakes[i] = new Snake(savedSnakes[i].brain);
  }

  //Download best snake in generation
  if (!human_player && autosave2.checked) {
    downloadBrainFiles(savedSnakes[0], 'best_fitness_snake_gen_' + generation + '_walls_' + walls);
  }

  updateEvolutionData();
  consoleLogGeneration(savedSnakes);

  disposeSavedSnakes();
}

//------------Fitness Formula, fitness must be >=0-------------
function calculateFitness() {
  for (let snake of savedSnakes) {
    if (best_score < 10) {//f3
      snake.fitness = ((snake.score + 1) ** 3) * snake.steps;
    } else {
      snake.fitness = (((snake.score + 1) * 2) ** 2) * (snake.steps ** (1.5))
    }
  }
}
//---------------------------------------------------------------

//Pick random snake with higher chance for high fitness snakes
function pickOne(snakes) {
  let total_fitness = 0;
  for (let snake of snakes) {
    total_fitness += snake.fitness;
  }
  let index = 0;
  let r = Math.random(1);
  while (r > 0) {
    r = r - snakes[index].fitness / total_fitness;
    index++;
  }
  index--;
  let snake = snakes[index];
  let child = new Snake(snake.brain);
  return child;
}

function compareSnakeFitness(a, b) {
  if (a.fitness < b.fitness) {
    return 1;
  }
  if (a.fitness > b.fitness) {
    return -1;
  }
  return 0;
}

function calcSnakesPerformance() {
  var total_score = 0;
  var total_fitness = 0;
  var best_score = 0;
  var best_fitness = 0;
  for (let snake of savedSnakes) {
    best_score = snake.score > best_score ? snake.score : best_score;
    best_fitness = snake.fitness > best_fitness ? snake.fitness : best_fitness;
    total_score += snake.score;
    total_fitness += snake.fitness;
  }
  return { best_score: best_score, best_fitness: best_fitness, score: total_score / savedSnakes.length, fitness: total_fitness / savedSnakes.length };
}

function updateEvolutionData() {
  var performance = calcSnakesPerformance();
  generationData.score.push(performance.best_score);
  generationData.fitness.push(performance.best_fitness);
  generationData.avg_score.push(performance.score);
  generationData.avg_fitness.push(performance.fitness);
  drawGenerationGraph(graph_canvas);
}

function disposeSavedSnakes() {
  for (let i = 0; i < savedSnakes.length; i++) {
    savedSnakes[i].dispose();
  }
  savedSnakes = [];
}

function disposePlayingSnakes() {
  for (let i = 0; i < snakes.length; i++) {
    if (snakes[i].brain) {
      snakes[i].dispose();
    }
  }
  snakes = [];
}

function consoleLogGeneration(bestSnakes) {
  console.log("------ Generation " + generation + " ------");
  console.log(tf.memory());
  console.log("best score:" + generationData.score[generationData.score.length - 1]);
  console.log("best fitness:" + generationData.fitness[generationData.fitness.length - 1]);
  console.log("avg score:" + generationData.avg_score[generationData.avg_score.length - 1]);
  console.log("avg fitness:" + generationData.avg_fitness[generationData.avg_fitness.length - 1]);
  console.log("snakes", bestSnakes);
}


