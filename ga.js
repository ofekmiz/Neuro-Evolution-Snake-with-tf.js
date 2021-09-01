// Neuro-Evolution Snake

function nextGeneration() {

  calculateFitness();
  let best_snake = pickBestSnake();
  for (let i = 0; i < total_snakes_in_generation; i++) {
    snakes[i] = new Snake(best_snake.brain);
    if (Math.random() >= 0.3) snakes[i].mutate();
  }

  for (let i = 0; i < total_snakes_in_generation; i++) {
    savedSnakes[i].dispose();
  }
  savedSnakes = [];

  console.log("--------------------");
  console.log("next generation");
  console.log(tf.memory());
  console.log("best score:" + best_snake.score);
  console.log("best fitness:" + best_snake.fitness);

}

function pickBestSnake() {
  let best_snake = savedSnakes[Math.floor(Math.random() * snakes.length)];
  for (let snake of savedSnakes) {
    if (snake.fitness > best_snake.fitness) best_snake = snake;
  }
  return best_snake;
}

function calculateFitness() {
  let best_fitness = 0;
  let best_score = 0;

  for (let snake of savedSnakes) {
    snake.fitness = snake.score * 5000 - snake.wall_hits * 40 - snake.life * 10;
    if (snake.fitness > best_fitness) {
      best_fitness = snake.fitness;
      best_score = snake.score;
    }
  }
}
