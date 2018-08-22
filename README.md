# Machine Learning Tetris

# Play tetris on the browser or watch it play using neuroevolution

## https://dcx2202.github.io/Machine-Learning-Tetris/

You can play using the WASD keys for moving, dropping and rotating, you can increase/decrease game speed with X and C and toggle the machine learning mode with V. You can also click on the handheld device buttons (useful if you are on mobile).

### You can edit a few parameters to change different aspects.

Some include enabling/disabling progressive generations (number of shapes limited per generation so as to master the first stages of the game before proceeding), play a different game each generation or not, population size and mutation rate.

### Fitness and Score

The fitness of each game is relative to the other games of the same generation and is based on the game's score.
The score is determined by how long the game is being played, how many lines are cleared, how many shapes are added (non progressive generations), density, height differences between columns, number of holes and how many shapes are dropped.

### Neuroevolution

The algorithm for neuroevolution is working but takes a bit of time training to see significant improvement.

The typical behaviour observed is at first it learns how not to lose immediatly, so it just stacks shapes on the side and then in the middle. Then it tries to increase the density by packing the shapes better. Due to that, sometimes it will clear a line. If different games are disabled then it will keep clearing that line every generation and eventually learn how to clear another and another.
The goals were to see it working (and it is) and watch it play better than me (it doesn't), so I might add another "mode" (maybe simulating every move and picking the best one) later. Below are some examples.

## Example before learning

![alt text](https://github.com/dcx2202/Machine-Learning-Tetris/blob/master/example_gen1.png)


## After learning for some generations (currently takes quite a bit of time)

![alt text](https://github.com/dcx2202/Machine-Learning-Tetris/blob/master/example_gen747.png)


## Other examples with different statistics

![alt text](https://github.com/dcx2202/Machine-Learning-Tetris/blob/master/examples.png)
