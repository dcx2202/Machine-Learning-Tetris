class NeuralNetwork
{
  constructor(input_nodes, hidden_nodes, output_nodes, child_in, child_out)
  {
    if(child_in && child_out) //If weights are passed as an argument then use them
    {
      this.input_nodes = input_nodes;
      this.hidden_nodes = hidden_nodes;
      this.output_nodes = output_nodes;

      this.input_weights = child_in;
      this.output_weights = child_out;
    }
    else //If not then initialize random weights
    {
      this.input_nodes = input_nodes;
      this.hidden_nodes = hidden_nodes;
      this.output_nodes = output_nodes;

      // Initialize random weights
      this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
      this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes]);
    }
  }

  //Get a prediction (next move)
  predict(input)
  {
       let output;
       tf.tidy(() => {
           let input_layer = tf.tensor(input, [1, this.input_nodes]);
           let hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
           let output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
           output = output_layer.dataSync();
       });
       return output;
   }

   //Make a copy of this neural network
   clone()
   {
        let copy = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
        copy.dispose();
        copy.input_weights = tf.clone(this.input_weights);
        copy.output_weights = tf.clone(this.output_weights);
        return copy;
   }

   //Dispose this neural network's weights
   dispose()
   {
     this.input_weights.dispose();
     this.output_weights.dispose();
   }
}
