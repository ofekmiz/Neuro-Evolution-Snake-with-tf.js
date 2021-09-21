// Neuro-Evolution Snake

function nextGeneration() {

  calculateFitness();
  let best_snake = pickBestSnake();
  for (let i = 0; i < total_snakes_in_generation; i++) {
    snakes[i] = new Snake(best_snake.brain);
    if (Math.random() >= 0.3) snakes[i].mutate(0.1);
  }

  console.log("--------------------");
  console.log("next generation");
  console.log(tf.memory());
  console.log("best score:" + best_snake.score);
  console.log("best fitness:" + best_snake.fitness);

  //dispose old snakes
  for (let i = 0; i < total_snakes_in_generation; i++) {
    savedSnakes[i].dispose();
  }
  savedSnakes = [];
}

function pickBestSnake() {
  let best_snake = savedSnakes[Math.floor(Math.random() * snakes.length)];
  for (let snake of savedSnakes) {
    if (snake.fitness > best_snake.fitness) best_snake = snake;
  }
  return best_snake;
}

function calculateFitness() {
  for (let snake of savedSnakes) {
    wall_penalty = snake.hit_wall ? 1000 : 0;
    snake.fitness = snake.score * 2000 + snake.steps * 20 - wall_penalty;
  }
}
