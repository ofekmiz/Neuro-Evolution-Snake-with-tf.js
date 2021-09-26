// Daniel Shiffman
// Neuro-Evolution Flappy Bird with TensorFlow.js
// http://thecodingtrain.com
// https://youtu.be/cdUNkwXx-I4

class NeuralNetwork {
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  crossover(otherBrain) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const otherWeights = otherBrain.model.getWeights();
      const crossOverWeights = []
      
      for (let i = 0; i < weights.length; i++) {
        let shape = weights[i].shape;
        let tensor1 = weights[i];
        let tensor2 = otherWeights[i];
        let values1 = tensor1.dataSync().slice();
        let values2 = tensor2.dataSync().slice();
        let mid = Math.floor(Math.random() * weights.length);

        for (let j = mid; j < values1.length; j++) {
          values1[j] = values2[j];
        }
        let newTensor = tf.tensor(values1, shape);
        crossOverWeights[i] = newTensor;
      }
      this.model.setWeights(crossOverWeights);
    });
  }

  dispose() {
    this.model.dispose();
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  createModel() {
    const model = tf.sequential();
    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'relu'
    });
    model.add(hidden);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'softmax'
    });
    model.add(output);
    return model;
  }
}
