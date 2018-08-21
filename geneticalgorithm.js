// Generate a new population
function generate(allGames)
{
  let newPlayers = [];

  //Sort games by fitness (descending order)
  allGames.sort(function(a, b) {
  return b.fitness - a.fitness;
});

  //Add the top 10% of the population to the next generation
  for(let i = 0; i < floor(allGames.length / 10); i++)
  {
    newPlayers[i] = allGames[i].player;
  }

  //Select parents according to fitness, crossOver and apply mutation, then add them to the next generation (remaining slots out of the total population)
  for (let i = floor(allGames.length / 10); i < allGames.length; i++)
  {
    // Select a game based on fitness
    let parent1 = poolSelection(allGames);
    let parent2 = poolSelection(allGames);

    let newMlPlayer = crossOver(parent1, parent2);
    mutate(newMlPlayer, mutationRate);
    newPlayers[i] = newMlPlayer;
  }
  return newPlayers;
}

//Select parents according to fitness, crossOver and apply mutation
function crossOver(parent1, parent2)
{
    //Get the parents' input and output weights
		let parent1_in = parent1.brain.input_weights.dataSync();
		let parent1_out = parent1.brain.output_weights.dataSync();
    let parent2_in = parent2.brain.input_weights.dataSync();
		let parent2_out = parent2.brain.output_weights.dataSync();

    //Find an index that will determine how much dna (input weights) the child will get from each parent
		let index = floor(random(1, parent1_in.length));

    //Get some input weights from parent 1 and the rest from parent 2
    let child_in = [...parent1_in.slice(0, index), ...parent2_in.slice(index, parent2_in.length)];

    //Find an index that will determine how much dna (output weights) the child will get from each parent
    index = floor(random(1, parent1_out.length));

    //Get some output weights from parent 1 and the rest from parent 2
    let child_out = [...parent1_out.slice(0, index), ...parent2_out.slice(index, parent2_out.length)];

    //Get the tensors' shapes
		let input_shape = parent1.brain.input_weights.shape;
		let output_shape = parent1.brain.output_weights.shape;

    //Create the new tensors holding the weights
    child_in = tf.tensor(child_in, input_shape);
    child_out = tf.tensor(child_out, output_shape);

    //Create a new Neural Network with the new weights
		let child_brain = new NeuralNetwork(240, 120, 4, child_in, child_out);

    //Return the a new player with the new brain
    return new MLPlayer(child_brain);
}

//Change some aspects of a player's brain according to a mutation rate
function mutate(newMlPlayer, mutationRate)
{
  //Get the weights as an array from the tensor
	let input_weights = newMlPlayer.brain.input_weights.dataSync();

  //Randomly mutate (or not) each value in each weights' tensor
  for(var i = 0; i < input_weights.length; i++)
  {
    if(random(1) < mutationRate)
    {
      let offset = randomGaussian() * 0.5;
      input_weights[i] += offset;
    }
  }

  let output_weights = newMlPlayer.brain.output_weights.dataSync();

  for(var i = 0; i < output_weights.length; i++)
  {
    if(random(1) < mutationRate)
    {
      let offset = randomGaussian() * 0.5;
      output_weights[i] += offset;
    }
  }

	let input_shape = newMlPlayer.brain.input_weights.shape;
  let output_shape = newMlPlayer.brain.output_weights.shape;

  //Dispose the old weights and create the new
	newMlPlayer.brain.input_weights.dispose();
	newMlPlayer.brain.input_weights = tf.tensor(input_weights, input_shape);

	newMlPlayer.brain.output_weights.dispose();
	newMlPlayer.brain.output_weights = tf.tensor(output_weights, output_shape);
}

// Normalize the fitness of all games
function normalizeFitness() {

  //Get a copy of the games
  games = JSON.parse(JSON.stringify(allGames));

  // Make score exponentially better
  for (let i = 0; i < games.length; i++) {
    games[i].score = pow(games[i].score, 2);
  }

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < games.length; i++) {
    sum += games[i].score;
  }
  // Divide by the sum
  for (let i = 0; i < games.length; i++) {
    allGames[i].fitness = games[i].score / sum;
  }
}

// Pick one game according to the games' fitness (higher fitness = higher probability of being picked)
function poolSelection(allGames) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0)
  {
    r -= allGames[index].fitness;
    index += 1;
  }

  // Go back one
  index -= 1;

  //Return the picked game's player
  return allGames[index].player;
}
