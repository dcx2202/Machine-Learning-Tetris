class MLGame
{
  //Preloads and configures assets to be used in the game
  constructor(I_, O_, T_, S_, Z_, J_, L_, mlplayer)
  {
    //Game Variables
    this.I = I_;
    this.O = O_;
    this.T = T_;
    this.S = S_;
    this.Z = Z_;
    this.J = J_;
    this.L = L_;
    this.shapes = [];
    this.score = 0;
    this.landedMap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    this.speedUp = false;
    this.defeat = false;
    this.speed = 24;
    this.player = mlplayer;

    //Statistics Variables
    this.linesRemoved = 0; //Number of lines removed
    this.numShapesAdded = 0; //Number of shapes added
    this.density = 0; //Number of squares occupied / total number of squares in the lines used
    this.level = 0; //Number of lines used (height)
    this.heights_sum = 0; //Sum of the heights of the columns
    this.heightDifferences_sum = 0; //Sum of the height differences between columns
    this.holes = 0; //Number of holes
    this.fitness = 0; //Fitness

    //Auxiliary variables
    this.lastIndex = 0;
  }

  //Triggers some action
  executeAction(action)
  {
  	if(!this.shapes[this.shapes.length - 1].locked && !this.defeat)
  	{
      if(action[3] > 0.9) //W
  		{
  			this.tryRotate();
  		}
  		else if(action[0] > 0.5) //A
  		{
  			this.tryMoveLeft();
  		}
  		else if(action[1] > 0.5) //D
  		{
  			this.tryMoveRight();
  		}
  		else if(action[2] > 0.5) //S
  		{
  			this.drop();
  		}
  	}
  }

  //Tries to move the current shape to the left checking for collisions before moving
  tryMoveLeft()
  {
  	if(this.shapes[this.shapes.length - 1].x >= 24 && !this.checkHorizontalCollisions(1))
  	{
  		this.shapes[this.shapes.length - 1].x -= 24;
  		for(var i = 0; i < this.shapes[this.shapes.length - 1].positions.length; i++)
  			this.shapes[this.shapes.length - 1].positions[i][0] -= 1;
  	}
  }

  //Tries to move the current shape to the right checking for collisions before moving
  tryMoveRight()
  {
  	if(this.shapes[this.shapes.length - 1].x < gameWidth - this.shapes[this.shapes.length - 1].width && !this.checkHorizontalCollisions(0))
  	{
  		this.shapes[this.shapes.length - 1].x += 24;
  		for(var i = 0; i < this.shapes[this.shapes.length - 1].positions.length; i++)
  			this.shapes[this.shapes.length - 1].positions[i][0] += 1;
  	}
  }

  //Tries to rotate current shape checking for collisions before rotating
  tryRotate()
  {
  	if(!this.checkRotationCollisions())
  	{
  		this.shapes[this.shapes.length - 1].rotate();
  	}
  }

  //Drops current shape
  drop()
  {
  	frameRate(60);
  	this.speedUp = true;
  	while(!this.shapes[this.shapes.length - 1].locked)
  		this.shapesDescend(this.speedUp);
  	this.speedUp = false;
    if(!progressiveGenerations)
  	 this.score += 40;
    frameRate(2);
  }

  //Adds a shape
  addShape(shape)
  {
  	if(shape)
  	{
  		this.shapes.push(new Tetrominu(shape));
  	}
  	this.lastIndex = this.shapes.length - 1;
    this.numShapesAdded++;
  }

  //Updates the statistics
  updateStats()
  {
    //Find how many lines are used
    let empty = true;
  	let usedLines = 0;

  	for(var j = 0; j < 20; j++)
  	{
  		for(var k = 0; k < 10; k++)
  		{
  			if(this.landedMap[j][k] != 0)
  			{
  				empty = false;
  			}
  		}
  		if(!empty)
  			usedLines++;
  		empty = true;
  	}

    //Find how many squares are occupied by a shape
    let squaresOccupied = 0;

    for(var j = 0; j < 20; j++)
  	{
  		for(var k = 0; k < 10; k++)
  		{
  			if(this.landedMap[j][k] == 1)
  				squaresOccupied++;
  		}
  	}

    //Calculate some statistics
    this.level = usedLines;
    this.density = squaresOccupied / (usedLines * 10);

    //Number of holes (column has some squares occupied and some not (holes))
    this.holes = 0;
    for(var j = 0; j < 10; j++) //For each column
  	{
      let occupied = false;
  		for(var k = 0; k < 20; k++) //For each row
  		{
  			if(this.landedMap[k][j] == 1) //If this square is occupied then count then there might be holes in this column
  				occupied = true;

        if(this.landedMap[k][j] == 0 && occupied) //If one square of this column is empty then it's a hole
    			this.holes++; //Increment the number of holes
  		}
  	}

    //Height of each column
    this.heights = [];
    for(var j = 0; j < 10; j++)
  	{
  		for(var k = 0; k < 20; k++)
  		{
  			if(this.landedMap[k][j] == 1) //If this column isn't empty then calculate its height
        {
  				this.heights[this.heights.length] = 20 - k;
          break;
        }
  		}
  	}

    //Height differences between columns
    this.heightDifferences = [];
    for(var j = 0; j < this.heights.length - 1; j++)
      this.heightDifferences[j] = abs(this.heights[j + 1] - this.heights[j]);

    //Max column height
    this.maxHeight = max(this.heights);

    //Column heights' sum
    this.heights_sum = 0;
    for(var j = 0; j < this.heights.length; j++)
    {
      this.heights_sum += this.heights[j];
    }

    //Sum of the height differences between columns
    this.heightDifferences_sum = 0;
    for(var j = 0; j < this.heightDifferences.length; j++)
    {
      this.heightDifferences_sum += this.heightDifferences[j];
    }

    //If this game is over update the score according to its statistics
    if(this.defeat)
    {
      if(!progressiveGenerations) //If progressive generations aren't disabled then don't add points according to the number of shapes added
        this.score += this.numShapesAdded * 10;
      else //If progressive generations are enabled assign a base score that will be changed according to the other stats
           //The base score is important to avoid bias between generations due to the number of shapes allowed
        this.score += 5000;

      //Decrease score according to the number of holes
      this.score -= this.holes * 100;

      //Decrease score according to the column height differences
      this.score -= this.heightDifferences_sum * 100;

      //Change the score according to the density (0 <= density <= 1 ; higher density = higher score)
      this.score = this.score * (this.density * 2);

      if(this.score < 0)
        this.score = 1;
    }
  }

  //Updates game speed
  updateSpeed()
  {
  	let newFrameRate = map(speed, 24, 120, 2, 60);
  	frameRate(newFrameRate);
  }

  //Descends shapes
  shapesDescend(checkSpeed)
  {
  	if(!checkSpeed)
  		this.updateSpeed();

  	//Stop shape from going off screen
  	if(this.shapes[this.shapes.length - 1].y >= gameHeight - this.shapes[this.shapes.length - 1].height)
  	{
  		this.shapes[this.shapes.length - 1].locked = true;
  	}

  	//Slow shape down near the bottom of the screen when dropped
  	if(this.shapes[this.shapes.length - 1].y + this.shapes[this.shapes.length - 1].speed >= gameHeight - this.shapes[this.shapes.length - 1].height)
  	{
  		this.shapes[this.shapes.length - 1].speed = 24;
  	}

  	//If it isn't colliding then descend
  	if(!this.shapes[this.shapes.length - 1].locked)
  	{
  		if(!this.checkCollisions(this.shapes[this.shapes.length - 1]))
  			this.shapes[this.shapes.length - 1].descend();
  	}

  	//If it collided, mark its position as occupied
  	if(this.shapes[this.shapes.length - 1].locked)
  	{
  		//Mark its position as occupied
  		if(this.shapes[this.shapes.length - 1].y >= 0)
  		{
  			for(var i = 0; i < this.shapes[this.shapes.length - 1].positions.length; i++)
  			{
  				var x = this.shapes[this.shapes.length - 1].positions[i][0];
  				var y = this.shapes[this.shapes.length - 1].positions[i][1];
          if(x <= 9 && y <= 19)
  				    this.landedMap[y][x] = 1;
  			}
  		}

  		//Check if there are full lines to be removed
  		this.removeLine();
  	}
  }

  //Checks if the current shape collided when descending
  checkCollisions(shape)
  {
  	for(var i = 0; i < this.shapes[this.shapes.length - 1].positions.length; i++)
  	{
  		var x = shape.positions[i][0];
  		var y = shape.positions[i][1];
  		if(x >= 0 && y >= 0 && y + 1 <= 19)
  			if(this.landedMap[y + 1][x] != 0)
  			{
  				shape.locked = true;
  				return true;
  			}
  	}
  	return false;
  }

  //Checks if the current shape would collide if moved sideways
  checkHorizontalCollisions(side)
  {
  	let temp = JSON.parse(JSON.stringify(this.shapes[this.shapes.length - 1].positions));
  	for(var i = 0; i < temp.length; i++)
  	{
  		if(side == 1)
  			temp[i][0]--;
  		else if(side == 0)
  			temp[i][0]++;
  	}

  	for(var i = 0; i < temp.length; i++)
  	{
  		var x = temp[i][0];
  		var y = temp[i][1];
  		if(x >= 0 && y >= 0 && y<= 19)
  		{
  			if(this.landedMap[y][x] != 0)
  			{
  				return true;
  			}
  		}
  	}
  	return false;
  }

  //Checks if the current shape would collide if rotated
  checkRotationCollisions()
  {
  	let state = this.shapes[this.shapes.length - 1].state;
  	this.shapes[this.shapes.length - 1].rotate();
  	let temp = JSON.parse(JSON.stringify(this.shapes[this.shapes.length - 1].positions));

  	while(this.shapes[this.shapes.length - 1].state != state)
  		this.shapes[this.shapes.length - 1].rotate();

  	for(var i = 0; i < temp.length; i++)
  	{
  		var x = temp[i][0];
  		var y = temp[i][1];
  		if(x >= 0 && y >= 0 && y<= 19)
  		{
  			if(this.landedMap[y][x] != 0)
  			{
  				return true;
  			}
  		}
  	}
  	return false;
  }

  //Checks if the player has lost
  checkDefeat()
  {
  	for(var i = 0; i < this.shapes.length; i++)
  	{
  		if(this.shapes[i].locked && this.shapes[i].y < 0)
  			this.defeat = true;
  	}
  }

  //Removes full lines
  removeLine()
  {
  	let full = true;
  	let lines = [];

  	//Find which lines to remove
  	for(var i = 0; i < 20; i++)
  	{
  		for(var j = 0; j < 10; j++)
  		{
  			if(this.landedMap[i][j] != 1)
  			{
  				full = false;
  			}
  		}
  		if(full)
  			lines.push(i);
  		full = true;
  	}

  	//Remove the shapes' pieces on those lines
  	for(var i = 0; i < lines.length; i++)
  	{
  		for(var j = 0; j < this.shapes.length; j++)
  		{
  			for(var k = this.shapes[j].positions.length - 1; k >= 0; k--)
  			{
  				if(this.shapes[j].positions[k][1] == lines[i])
  				{
  					this.landedMap[lines[i]][this.shapes[j].positions[k][0]] = 0;
  					this.shapes[j].positions.splice(k, 1);
  				}
  			}
  		}
  	}

  	//Descend shapes above for every line removed
  	for(var i = 0; i < lines.length; i++)
  	{
  		for(var l = lines[i] - 1; l >= 0; l--)
  		{
  			for(var j = 0; j < this.shapes.length; j++)
  			{
  				for(var k = 0; k < this.shapes[j].positions.length; k++)
  				{
  					if(this.shapes[j].positions[k][1] == l)
  					{
  						this.landedMap[l][this.shapes[j].positions[k][0]] = 0;
  						this.shapes[j].positions[k][1]++;
  						this.landedMap[l + 1][this.shapes[j].positions[k][0]] = 1;
  					}
  				}
  			}
  		}
  	}

  	//Increase score according to how many lines were removed
    if(lines.length > 0)
    {
    	this.score = this.score + (pow(lines.length + 1, 5) * 100);
      this.linesRemoved += lines.length;
    }
  }

  //Called every cycle
  play()
  {
  	if(!this.defeat) //If the player hasn't lost yet
  	{
  		//Increase score
  		this.score += 10;

  		//Descend shape
  		this.shapesDescend(this.speedUp);
  	}
  	else //If the player lost
  	{
      this.player.score = this.score;
  	}

  	//Check if player has lost
  	this.checkDefeat();

    //Update the stats
    this.updateStats();
  }
}
