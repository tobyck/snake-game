// set up the canvas and context
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

// new game function
function newGame() {
    // settings for how the boxes will look
    var box = {
        size: 20,
        padding: 3,
        count: 20
    }

    // starting position and length of the snake
    var snake = [];
    for (var i = 0; i < 5; i++) {
        snake.push({
            x: ~~(box.count / 2) - i - 1,
            y: Math.ceil(box.count / 2)
        });
    }

    // define the food which and put in an easy place first
    var food = {
        x: ~~(box.count * 0.75),
        y: snake[0].y
    }

    // other variables
    var direction = "right",
        started = false,
        score = 0,
        best = parseInt(localStorage.getItem("best")) || 0;

    // size the canvas
    canvas.width = canvas.height = box.count * (box.size + box.padding) + box.padding;

    // render the game at the start
    update();
    renderStats();

    // function to put food in a random place
    function genFood() {
        ["x", "y"].forEach(axis => {
            var potentialPos = ~~(Math.random() * box.count) + 1;
            for (snakeBox of snake) {
                if (snakeBox[axis] == potentialPos) {
                    genFood();
                    return;
                } else {
                    food[axis] = potentialPos;
                }
            }
        })
    }

    // function to render the whole game
    function update() {
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // render food
        ctx.fillStyle = "#f23232";
        ctx.fillRect(food.x * (box.size + box.padding) - box.size, food.y * (box.size + box.padding) - box.size, box.size, box.size)

        // update the snake
        if (direction == "up") {
            snake.unshift({
                x: snake[0].x,
                y: snake[0].y - 1
            });
        } else if (direction == "left") {
            snake.unshift({
                x: snake[0].x - 1,
                y: snake[0].y
            });
        } else if (direction == "down") {
            snake.unshift({
                x: snake[0].x,
                y: snake[0].y + 1
            });
        } else {
            snake.unshift({
                x: snake[0].x + 1,
                y: snake[0].y
            });
        }

        snake.pop();

        // render the snake
        ctx.fillStyle = "#59c942";
        for (snakeBox of snake) {
            ctx.fillRect(snakeBox.x * (box.size + box.padding) - box.size, snakeBox.y * (box.size + box.padding) - box.size, box.size, box.size)
        }

        // check if the snake has eaten food
        if (snake[0].x == food.x && snake[0].y == food.y) {
            snake.push({
                x: snake[snake.length - 1].x,
                y: snake[snake.length - 1].y
            })
            genFood();
            score++;
            renderStats();
        }

        // check if the snake is dead
        if (snake[0].x < 0 || snake[0].x > box.count || snake[0].y < 0 || snake[0].y > box.count || snake.slice(1).map(x => Object.values(x).toString()).includes(Object.values(snake[0]).toString())) {
            clearInterval(gameLoop);
            newGame();
        }
    }

    // update score and best
    function renderStats() {
        if (score > best) {
            best = score;
            localStorage.setItem("best", best);
        }

        document.getElementById("score").innerHTML = `Score: ${score}`;
        document.getElementById("best").innerHTML = `Best: ${best}`;
    }

    // handle key presses to control the snake
    document.addEventListener("keydown", event => {
        var key = event.key.toLowerCase();
        if (["w", "arrowup"].includes(key)) {
            if (direction != "down") direction = "up";
        } else if (["a", "arrowleft"].includes(key)) {
            if (direction != "right") direction = "left";
        } else if (["s", "arrowdown"].includes(key)) {
            if (direction != "up") direction = "down";
        } else if (["d", "arrowright"].includes(key)) {
            if (direction != "left") direction = "right";
        }

        if (!started && ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
            started = true;
            gameLoop = setInterval(update, 1000 / (9 + ((snake.length - 5) / 3)));
        }
    });
}

newGame();