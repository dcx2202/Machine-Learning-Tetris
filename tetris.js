//Page Variables
let logo;
let canvas;
let canvasHeight = 480;
let canvasWidth = 350;
let gameWidth = 240;
let gameHeight = 480;


//Game Variables
let I = [];
let O = [];
let T = [];
let S = [];
let Z = [];
let J = [];
let L = [];
let shapes = [];
let score;
let landedMap;
let speedUp;
let defeat;
let speed;
let nextShape;
let nextShapes = [];


//Audio Variables
let theme_song;
let hit;
let drop_hit;
let rotate;
let remove_line;


//Auxiliary Variables
let lastIndex;
let playOnce;
let gamesPlayed = 0;


//Machine Learning mode constants
const totalPopulation = 100;
const numPredicts = 1;
const mutationRate = 0.05;
const differentGames = false;
let progressiveGenerations = true;

//Machine Learning mode variables (statistics, ...)
let ML;
let maxNumShapes = 5; //Starting number of shapes if progressive generations are enabled
let maxLinesRemoved = 0; //Max number of lines removed (of every game played)
let linesRemoved = 0;
let averageLevel = 0; //Average level (of the generation)
let averageHeightDiffs = 0; //Average height differences between columns (every game played)
let totalHeightDiffs = 0;
let averageNumHoles = 0; //Average number of holes (every game played)
let totalNumHoles = 0;
let averageNumShapesAdded = 0; //Average number of shapes added (in the generation)
let averageDensity = 0; //Average density (every game played)
let totalDensity = 0;
let averageScore = 0; //Average score (every game played)
let totalScore = 0;
let maxScore = 0; //Max score (with weights for statistics applied) (every game played)
let maxFitness = 0; //Max fitness of a generation
let generation = 1;
let allGames = [];
let activeGames = [];


//Preloads and configures assets to be used in the game
function preload()
{
	//Images used
	I.push(loadImage('resources/I1.png'));
	I.push(loadImage('resources/I2.png'));

	O.push(loadImage('resources/O1.png'));

	T.push(loadImage('resources/T1.png'));
	T.push(loadImage('resources/T2.png'));
	T.push(loadImage('resources/T3.png'));
	T.push(loadImage('resources/T4.png'));

	S.push(loadImage('resources/S1.png'));
	S.push(loadImage('resources/S2.png'));

	Z.push(loadImage('resources/Z1.png'));
	Z.push(loadImage('resources/Z2.png'));

	J.push(loadImage('resources/J1.png'));
	J.push(loadImage('resources/J2.png'));
	J.push(loadImage('resources/J3.png'));
	J.push(loadImage('resources/J4.png'));

	L.push(loadImage('resources/L1.png'));
	L.push(loadImage('resources/L2.png'));
	L.push(loadImage('resources/L3.png'));
	L.push(loadImage('resources/L4.png'));

	logo = loadImage('resources/tetris.png');

	//Sounds used
	soundFormats('mp3');
	theme_song = loadSound('resources/theme_song.mp3');
	hit = loadSound('resources/hit.mp3');
	drop_hit = loadSound('resources/drop_hit.mp3');
	rotate = loadSound('resources/rotate.mp3');
	whoosh = loadSound('resources/whoosh.mp3');
	remove_line = loadSound('resources/remove_line.mp3');
	gameover = loadSound('resources/gameover.mp3');

	theme_song.setVolume(0.2);
	hit.setVolume(0.2);
	drop_hit.setVolume(0.2);
	rotate.setVolume(0.2);
	whoosh.setVolume(0.2);
	remove_line.setVolume(0.2);
	gameover.setVolume(0.2);

	//Setup the playing screen
	background(0);
	strokeWeight(3);
	stroke(0);
	fill(60, 60, 60);
	rect(240, -1, 110, 481);
	image(logo, 252, 410);
	fill(0, 0, 0);
	rect(250, 10, 90, 116);
	image(nextShape[0], 240 + (110 - nextShape[0].width) / 2, 10 + (116 - nextShape[0].height) / 2);
}

//Called when the page loads for the first time, prepares the game
function setup()
{
	//Setup the canvas
	frameRate(2);
	background(0);
	theme_song.loop();
	canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent('canvascontainer');
	centerSketch();

	//Setup the manual mode game
	landedMap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
	defeat = false;
	playOnce = true;
	score = 0;
	lastIndex = shapes.length - 1;
	speedUp = false;
	speed = 24;
	ML = 0;
	resetGenStats();

	pickShape();
	addShape(nextShape);
}

//Called when a key is pressed, triggering the action
function keyPressed()
{
	if(keyCode == 86) //V
		toggleML();

	if(keyCode == 82 && !ML) //R
		restart();

	if(keyCode == 67) //C
		increaseSpeed();

	if(keyCode == 88) //X
		decreaseSpeed();

	if(shapes.length > 0)
	{
		if(!ML && !shapes[lastIndex].locked && !defeat)
		{
			if(keyCode == 65) //A
				tryMoveLeft();

			if(keyCode == 68) //D
				tryMoveRight();

			if(keyCode === 83) //S
				drop();

			if(keyCode == 87) //W
				tryRotate();
		}
	}
}

//Called when mouse is pressed and checks if it was pressed over any button, triggering the action in case it was
function mousePressed()
{
	if(mouseX >= 276 && mouseX <= 395 && mouseY >= 740 && mouseY <= 856) //V
		toggleML();

	if(mouseX >= 307 && mouseX <= 359 && mouseY >= 584 && mouseY <= 631 && !ML) //R
		restart();

	if(mouseX >= 139 && mouseX <= 191 && mouseY >= 584 && mouseY <= 631) //C
		increaseSpeed();

	if(mouseX >= -27 && mouseX <= 28 && mouseY >= 584 && mouseY <= 631) //X
		decreaseSpeed();

	if(shapes.length > 0)
	{
		if(!ML && !shapes[lastIndex].locked && !defeat)
		{
			if(mouseX >= -81 && mouseX <= -10 && mouseY >= 858 && mouseY <= 925) //A
				tryMoveLeft();

			if(mouseX >= 97 && mouseX <= 171 && mouseY >= 858 && mouseY <= 925) //D
				tryMoveRight();

			if(mouseX >= 9 && mouseX <= 77 && mouseY >= 942 && mouseY <= 1009) //S
				drop();

			if(mouseX >= 9 && mouseX <= 80 && mouseY >= 775 && mouseY <= 840) //W
				tryRotate();
		}
	}
}

//Tries to move the current shape to the left checking for collisions before moving
function tryMoveLeft()
{
	if(shapes[lastIndex].x >= 24 && !checkHorizontalCollisions(1))
	{
		shapes[lastIndex].x -= 24;
		for(var i = 0; i < shapes[lastIndex].positions.length; i++)
			shapes[lastIndex].positions[i][0] -= 1;
		whoosh.play();
	}
}

//Tries to move the current shape to the right checking for collisions before moving
function tryMoveRight()
{
	if(shapes[lastIndex].x < gameWidth - shapes[lastIndex].width && !checkHorizontalCollisions(0))
	{
		shapes[lastIndex].x += 24;
		for(var i = 0; i < shapes[lastIndex].positions.length; i++)
			shapes[lastIndex].positions[i][0] += 1;
		whoosh.play();
	}
}

//Tries to rotate current shape checking for collisions before rotating
function tryRotate()
{
	if(!checkRotationCollisions())
	{
		shapes[lastIndex].rotate();
		rotate.play();
	}
}

//Drops current shape
function drop()
{
	frameRate(60);
	speedUp = true;
	while(!shapes[lastIndex].locked)
		shapesDescend(speedUp);
	speedUp = false;
	drop_hit.play();
	score += 40;
}

//Increases current shape speed
function increaseSpeed()
{
	speed += 24;
	if(speed > 120)
		speed = 120;
}

//Decreases current shape speed
function decreaseSpeed()
{
	speed -= 24;
	if(speed < 24)
		speed = 24;
}

//Restarts game
function restart()
{
	landedMap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

	shapes = [];
	defeat = false;
	playOnce = true;
	gameover.stop();
	if(!theme_song.isPlaying())
		theme_song.play();
	score = 0;

	x = 0;
	y = 0;
	lastIndex = shapes.length - 1;
	speedUp = false;

	pickShape();
	addShape();
}

//Updates the statistics
function updateStats()
{
	//Normalize the games' fitness according to their score (total population fitness = 1 ; each game's fitness ranges from 0 to 1)
	normalizeFitness();
	resetGenStats();
	//Updates the statistics
	for(var i = 0; i < allGames.length; i++)
	{
		linesRemoved += allGames[i].linesRemoved;
		averageNumShapesAdded += allGames[i].numShapesAdded;
		averageLevel += allGames[i].level;
		if(allGames[i].score > maxScore)
			maxScore = allGames[i].score;
		if(allGames[i].linesRemoved > maxLinesRemoved)
			maxLinesRemoved = allGames[i].linesRemoved;

		if(activeGames.length == 0) //Update only if there are no active games
		{
			totalDensity += allGames[i].density;
			totalScore += allGames[i].score;
			totalHeightDiffs += allGames[i].heightDifferences_sum;
			totalNumHoles += allGames[i].holes;

			if(allGames[i].fitness > maxFitness)
				maxFitness = allGames[i].fitness;
		}
	}
	averageNumShapesAdded = averageNumShapesAdded / allGames.length;
	averageLevel = averageLevel / allGames.length;

	if(activeGames.length == 0) //Update only if there are no active games
	{
		averageDensity = totalDensity / gamesPlayed;
		averageScore = totalScore / gamesPlayed;
		averageHeightDiffs = totalHeightDiffs / gamesPlayed;
		averageNumHoles = totalNumHoles / gamesPlayed;
	}
}

//Toggles who is playing (player or ML)
function toggleML()
{
	if(ML == 0)
	{
		ML = 1;
		resetML();
	}
	else
	{
		ML = 0;
		resetML();
	}
	restart();
}

//Resets the ML mode
function resetML()
{
	resetGenStats();
	maxScore = 0;
	generation = 1;

	allGames = [];
	activeGames = [];
	if(differentGames)
		nextShapes = [];
}

function resetGenStats()
{
	averageLinesRemoved = 0;
	averageLevel = 0;
	averageNumShapesAdded = 0;
	maxFitness = 0;
}

//Adds a shape
function addShape(shape)
{
	if(shape)
	{
		shapes.push(new Tetrominu(shape));
	}
	//pickShape();
	lastIndex = shapes.length - 1;
}

//Picks next shape
function pickShape()
{
	let rand = Math.floor(random(7));
	switch(rand)
	{
		case 0:	nextShape = I; break;
		case 1:	nextShape = O; break;
		case 2:	nextShape = T; break;
		case 3:	nextShape = S; break;
		case 4:	nextShape = Z; break;
		case 5:	nextShape = J; break;
		case 6:	nextShape = L; break;
	}
}

//Updates game speed
function updateSpeed()
{
	let newFrameRate = map(speed, 24, 120, 2, 20);
	frameRate(newFrameRate);
}

//Descends shapes
function shapesDescend(checkSpeed)
{
	if(!checkSpeed)
		updateSpeed();

	//Stop shape from going off screen
	if(shapes[lastIndex].y >= height - shapes[lastIndex].height)
	{
		shapes[lastIndex].locked = true;
	}

	//Slow shape down near the bottom of the screen when dropped
	if(shapes[lastIndex].y + shapes[lastIndex].speed >= height - shapes[lastIndex].height)
	{
		shapes[lastIndex].speed = 24;
	}

	//If it isn't colliding then descend
	if(!shapes[lastIndex].locked)
	{
		if(!checkCollisions(shapes[lastIndex]))
			shapes[lastIndex].descend();
	}

	//If it collided, mark its position as occupied
	if(shapes[lastIndex].locked)
	{
		//Play hit sound
		hit.play();

		//Mark its position as occupied
		if(shapes[lastIndex].y >= 0)
		{
			for(var i = 0; i < shapes[lastIndex].positions.length; i++)
			{
				var x = shapes[lastIndex].positions[i][0];
				var y = shapes[lastIndex].positions[i][1];
				landedMap[y][x] = 1;
			}
		}

		//Check if there are full lines to be removed
		removeLine();
	}
}

//Checks if the current shape collided when descending
function checkCollisions(shape)
{
	for(var i = 0; i < shapes[lastIndex].positions.length; i++)
	{
		var x = shape.positions[i][0];
		var y = shape.positions[i][1];
		if(x >= 0 && y >= 0 && y + 1 <= 19)
			if(landedMap[y + 1][x] != 0)
			{
				shape.locked = true;
				return true;
			}
	}
	return false;
}

//Checks if the current shape would collide if moved sideways
function checkHorizontalCollisions(side)
{
	let temp = JSON.parse(JSON.stringify(shapes[lastIndex].positions));
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
			if(landedMap[y][x] != 0)
			{
				return true;
			}
		}
	}
	return false;
}

//Checks if the current shape would collide if rotated
function checkRotationCollisions()
{
	let state = shapes[lastIndex].state;
	shapes[lastIndex].rotate();
	let temp = JSON.parse(JSON.stringify(shapes[lastIndex].positions));

	while(shapes[lastIndex].state != state)
		shapes[lastIndex].rotate();

	for(var i = 0; i < temp.length; i++)
	{
		var x = temp[i][0];
		var y = temp[i][1];
		if(x >= 0 && y >= 0 && y<= 19)
		{
			if(landedMap[y][x] != 0)
			{
				return true;
			}
		}
	}
	return false;
}

//Checks if the player has lost
function checkDefeat()
{
	for(var i = 0; i < shapes.length; i++)
	{
		if(shapes[i].locked && shapes[i].y < 0)
			defeat = true;
	}
}

//Removes full lines
function removeLine()
{
	let full = true;
	let lines = [];

	//Find which lines to remove
	for(var i = 0; i < 20; i++)
	{
		for(var j = 0; j < 10; j++)
		{
			if(landedMap[i][j] != 1)
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
		for(var j = 0; j < shapes.length; j++)
		{
			for(var k = shapes[j].positions.length - 1; k >= 0; k--)
			{
				if(shapes[j].positions[k][1] == lines[i])
				{
					landedMap[lines[i]][shapes[j].positions[k][0]] = 0;
					shapes[j].positions.splice(k, 1);
				}
			}
		}
	}

	//Descend shapes above for every line removed
	for(var i = 0; i < lines.length; i++)
	{
		for(var l = lines[i] - 1; l >= 0; l--)
		{
			for(var j = 0; j < shapes.length; j++)
			{
				for(var k = 0; k < shapes[j].positions.length; k++)
				{
					if(shapes[j].positions[k][1] == l)
					{
						landedMap[l][shapes[j].positions[k][0]] = 0;
						shapes[j].positions[k][1]++;
						landedMap[l + 1][shapes[j].positions[k][0]] = 1;
					}
				}
			}
		}
	}

	//Increase score according to how many lines were removed
	score = score + (pow(lines.length, 4) * 100);
}

//Centers the canvas
function centerSketch()
{
	//Gameboy margins
	let x = 142;
	let y = 53;

	//Get center page coordinates
	if(windowWidth / 2 - canvasWidth / 2 >= 142)
		x = windowWidth / 2 - canvasWidth / 2;

	//Reposition the game screen
	canvas.position(x, y);
}

//Called when window is resized
function windowResized()
{
	//Centers the sketch
	centerSketch();
}

//Adds the current falling shape to the information passed to the MLPlayer
function addCurShapeMap(i)
{
	//Auxiliary map used to represent the parts of the shape outside the screen
	let auxmap1 = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

	let auxmap2 = JSON.parse(JSON.stringify(activeGames[i].landedMap));

	//Add every position of the shape to the auxiliary maps
	for(var k = 0; k < activeGames[i].shapes[activeGames[i].shapes.length - 1].positions.length; k++)
	{
		if(activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][1] < 0)
		{
			let x = activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][0];
			let y = map(activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][1], -4, -1, 0, 3);
			if(x <= 9 && y <= 19)
				auxmap1[y][x] = 1;
		}
		else if(activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][1] >= 0)
		{
			let x = activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][0];
			let y = activeGames[i].shapes[activeGames[i].shapes.length - 1].positions[k][1];
			if(x <= 9 && y <= 19)
				auxmap2[y][x] = 1;
		}
	}
	return auxmap1.concat(auxmap2);
}

//Called every cycle
function draw()
{
	if(!ML)
	{
		//Set frame rate
		frameRate(2);

		//Game background color
		background(0);

		//Right sidebar color
		fill(60, 60, 60);

		//Draw sidebar
		rect(240, -1, 110, 481);

		//Draw Tetris logo
		image(logo, 252, 410);

		//Draw next shape
		fill(0, 0, 0);
		rect(250, 10, 90, 116);
		image(nextShape[0], 240 + (110 - nextShape[0].width) / 2, 10 + (116 - nextShape[0].height) / 2);

		//Display score
		textAlign(CENTER);
		textSize(15);
		fill(255);
		text('SCORE: ' + score, 295, 160);

		if(!defeat) //If the player hasn't lost yet
		{
			//Increase score
			score += 1;

			//Draw previous shapes
			for(let i = 0; i < shapes.length; i++)
			{
				strokeWeight(3);
				stroke(0);
				shapes[i].show();
			}

			//Add next shape
			if(shapes.length == 0 || shapes[lastIndex].locked)
			{
				addShape(nextShape);
				pickShape();
			}

			//Descend shape
			shapesDescend(speedUp);
		}
		else //If the player lost
		{
			//Draw previous shapes
			for(let i = 0; i < shapes.length; i++)
			{
				strokeWeight(3);
				stroke(0);
				shapes[i].show();
			}

			//Stop music
			theme_song.pause();

			//Play gameover sound effect once
			if(playOnce)
			{
				gameover.play();
				playOnce = false;
			}

			//Paint the screen red (10% transparent)
			fill(255, 0, 0, 90);
			rect(0, 0, canvasWidth, canvasHeight);

			//Display 'GAMEOVER'
			textAlign(CENTER);
			textSize(40);
			fill(255);
			text('GAMEOVER', canvasWidth / 2, canvasHeight / 2);
		}

		//Check if player has lost
		checkDefeat();
	}
	else
	{
		//Set frame rate
		frameRate(2);

		//Game background color
		background(0);

		//Right sidebar color
		fill(60, 60, 60);

		//Draw sidebar
		rect(240, -1, 110, 481);

		//Draw Tetris logo
		image(logo, 252, 410);

		//If there are no active games, start next generation
		if(activeGames.length == 0 && allGames.length != 0)
		{
			//Generate a new population of players
			let newMlPlayers = generate(allGames);

			//Reset the generation stats
			resetGenStats();

			//Increase the generation
			generation++;

			//If progressive generations are enabled then increase the number of shapes
			//added to each game according to the current generation number
			if(progressiveGenerations && generation % 10 == 0 && generation < 200) //Until generation 100
			{
				maxNumShapes++; //Allow one more shapes each 10 generations
			}
			else if(progressiveGenerations && generation >= 200) //If it is currently the 100th generation then take off the limit
			{
				progressiveGenerations = false;
			}

			allGames = [];
			activeGames = [];

			//If different games are to be played each generation then clear the nextShapes array
			if(differentGames)
				nextShapes = [];

			pickShape();
			nextShapes.push(nextShape);
			pickShape();
			nextShapes.push(nextShape);

			//Create games for each new player
			for(var i = 0; i < newMlPlayers.length; i++)
			{
				let game = new MLGame(I, O, T, S, Z, J, L, newMlPlayers[i]);
				allGames.push(game);
				activeGames.push(game);
			}
		}

		//If there are no games, add games and choose next shape
		if(allGames.length == 0)
		{
			for(var i = 0; i < totalPopulation; i++)
			{
				let game = new MLGame(I, O, T, S, Z, J, L, new MLPlayer());
				allGames.push(game);
				activeGames.push(game);
			}
			pickShape();
			nextShapes.push(nextShape);
			pickShape();
			nextShapes.push(nextShape);
		}

		//For every active game
		for(var i = 0; i < activeGames.length; i++)
		{
			if(activeGames[i].shapes.length == 0 || activeGames[i].shapes[activeGames[i].shapes.length - 1].locked) //If the game just started or a shape has just been set
			{
				if(activeGames[i].shapes.length == nextShapes.length - 1) //Add a new shape and push to the nextShapes so that the other games can add it later
				{
					if(progressiveGenerations && nextShapes.length < maxNumShapes) //If progressive generations are enabled then only add shapes while below this generation's limit
					{
						activeGames[i].addShape(nextShapes[activeGames[i].shapes.length]);
					}
					else if(progressiveGenerations) //If the limit has been reached then end the game
					{
						activeGames[i].defeat = true;
						activeGames[i].updateStats();
					}
					else //Progressive generations are disabled and add the shapes normally
					{
						activeGames[i].addShape(nextShapes[activeGames[i].shapes.length]);
					}
						pickShape();
						nextShapes.push(nextShape);
				}
				else if(activeGames[i].shapes.length < nextShapes.length) //If there are shapes picked by other games still to spawn in this one
				{
					if(progressiveGenerations && activeGames[i].shapes.length < maxNumShapes) //If progressive generations are enabled then only add shapes while below this generation's limit
					{
						activeGames[i].addShape(nextShapes[activeGames[i].shapes.length]); //Add the next shape
					}
					else if(progressiveGenerations) //If the limit has been reached then end the game
					{
						activeGames[i].defeat = true;
						activeGames[i].updateStats();
					}
					else //Progressive generations are disabled and add the shapes normally
					{
						activeGames[i].addShape(nextShapes[activeGames[i].shapes.length]); //Add the next shape
					}
				}
			}

			//Let the MLPlayer think three times (eg. allow multiple rotations per frame)
			for(var j = 0; j < numPredicts; j++)
			{
				let action = activeGames[i].player.think(addCurShapeMap(i)); //Get the actions to execute
				activeGames[i].executeAction(action); //Execute actions
			}
			activeGames[i].play();
			if(activeGames[i].defeat)
			{
				//allGames[i] = JSON.parse(JSON.stringify(activeGames[i]));
				allGames[i] = activeGames[i];
				activeGames.splice(i, 1);
				gamesPlayed++;
			}
		}

		//Draw next shape
		fill(0, 0, 0);
		rect(250, 10, 90, 116);
		if(activeGames.length > 0)
			image(nextShapes[activeGames[0].shapes.length][0], 240 + (110 - nextShapes[activeGames[0].shapes.length][0].width) / 2, 10 + (116 - nextShapes[activeGames[0].shapes.length][0].height) / 2);

		//Updates the statistics
    updateStats();

		//Display score
		textAlign(CENTER);
		textSize(15);
		fill(255);
		if(activeGames.length > 0)
			text('SCORE: ' + activeGames[0].score, 295, 145);

		//Display statistics
		strokeWeight(1.8);
		textSize(11);
		text('Playing\n' + activeGames.length + " of " + totalPopulation, 295, 160);
		text('Av. Height Diffs.\n' + nf(averageHeightDiffs, 0, 2), 295, 190);
		text('Av. Density\n' + nf(averageDensity, 0, 3), 295, 220);
		text('Av. Num. Holes\n' + nf(averageNumHoles, 0, 2), 295, 250);
		text('Av. Score\n' + nf(averageScore, 0, 2), 295, 280);
		text('Max Score\n' + nf(maxScore, 0, 2), 295, 310);
		text('Max Lines Removed\n' + maxLinesRemoved, 295, 340);
		text('Max Fitness\n' + nf(maxFitness, 0, 8), 295, 370);
		text('Generation ' + generation, 295, 400);

		//If there are active games then draw the first one in the array
		if(activeGames.length > 0)
		{
			//Draw previous shapes
			for(var i = 0; i < activeGames[0].shapes.length; i++)
			{
				strokeWeight(3);
				stroke(0);
				activeGames[0].shapes[i].show();
			}
		}
	}
}
