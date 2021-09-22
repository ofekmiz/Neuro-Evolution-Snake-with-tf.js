// Neuro-Evolution Snake

function nextGeneration() {

  calculateFitness();
  let best_snake = pickBestSnake();
  for (let i = 0; i < total_snakes_in_generation; i++) {
    snakes[i] = new Snake(best_snake.brain);
    if (Math.random() >= 0.3) snakes[i].mutate(0.1);
  }

  let avg = calcAvgScore();
  generationData.score.push(best_snake.score);
  generationData.fitness.push(best_snake.fitness);
  generationData.avg_score.push(avg);
  drawNetworkGraph(graph_canvas, generationData.score, generationData.fitness, generationData.avg_score, generationData.avg_score);

  console.log("--------------------");
  console.log("next generation");
  console.log(tf.memory());
  console.log("best score:" + best_snake.score);
  console.log("best fitness:" + best_snake.fitness);
  console.log("avg score:" + avg);

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

function calcAvgScore() {
  var total_score = 0;
  for (let snake of savedSnakes) {
    total_score += snake.score;
  }
  return total_score / savedSnakes.length;
}

function calculateFitness() {
  for (let snake of savedSnakes) {
    wall_penalty = snake.hit_wall ? 50 : 0;
    // snake.fitness = snake.score * 3000 + snake.steps * 10 - wall_penalty;
    snake.fitness = snake.score *50 + snake.steps*2 - wall_penalty;
  }
}
