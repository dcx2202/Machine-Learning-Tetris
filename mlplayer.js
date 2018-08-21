class MLPlayer
{
  constructor(brain)
  {
    if(brain instanceof NeuralNetwork) //If a brain is passed as an argument then create a new player with that brain
    {
      this.brain = brain.clone();
    }
    else //If not then create a new brain
    {
      this.brain = new NeuralNetwork(240, 120, 4);
    }
  }

  //Get a prediction using this player's brain
  think(info)
  {
    return this.brain.predict([].concat.apply([], info));
  }
}
