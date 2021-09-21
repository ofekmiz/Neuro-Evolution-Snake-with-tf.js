// Neuro-Evolution Snake with TensorFlow.js

class NeuralNetwork {
  constructor(a, b, c, d, e) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes_1 = c;
      this.hidden_nodes_2 = d;
      this.output_nodes = e;
    } else {
      this.input_nodes = a;
      this.hidden_nodes_1 = b;
      this.hidden_nodes_2 = c;
      this.output_nodes = d;
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
        this.hidden_nodes_1,
        this.hidden_nodes_2,
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
          if (Math.random() < rate) {
            let w = values[j];
            values[j] = w + randomGaussian(6);
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
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
    const hidden_1 = tf.layers.dense({
      units: this.hidden_nodes_1,
      inputShape: [this.input_nodes],
      activation: 'sigmoid'
    });
    model.add(hidden_1);
    const hidden_2 = tf.layers.dense({
      units: this.hidden_nodes_2,
      inputShape: [this.hidden_nodes_1],
      activation: 'sigmoid'
    });
    model.add(hidden_2);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'softmax'
    });
    model.add(output);
    return model;
  }
}


