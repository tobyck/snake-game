// set up the canvas and context
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

// settings for how the boxes will look
var box = {
    size: 20,
    padding: 3,
    count: 20 
}

// new game function
function newGame() {
    // starting position and length of the snake
    var snake = [];
    for (var i = 0; i < 5; i++) {
        snake.push({
            x: ~~(box.count / 2) - i,
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
        lastDirection = "left",
        started = false,
        score = 0,
        best = parseInt(localStorage.getItem("best")) || 0;

    // size elements for responsive design
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

        // render the snake
        ctx.fillStyle = "#539c44";
        for (snakeBox of snake) {
            if (snake.indexOf(snakeBox) > 0) {
                ctx.fillStyle = "#59c942";
            }
            ctx.fillRect(snakeBox.x * (box.size + box.padding) - box.size, snakeBox.y * (box.size + box.padding) - box.size, box.size, box.size)
        }

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
        lastDirection = direction;

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
        if (snake[0].x < 1 || snake[0].x > box.count || snake[0].y < 1 || snake[0].y > box.count || snake.slice(1).map(x => Object.values(x).toString()).includes(Object.values(snake[0]).toString())) {
            clearInterval(gameLoop);
            setTimeout(() => message(`Game over.\n\nScore: ${score}\nBest: ${best}\n\nPress enter or space, or click anywhere outside of this box to play again.`), 1500)
        }
    }

    // update score
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
        if (["w", "arrowup"].includes(key) && lastDirection != "down") direction = "up";
        if (["a", "arrowleft"].includes(key) && lastDirection != "right") direction = "left";
        if (["s", "arrowdown"].includes(key) && lastDirection != "up") direction = "down";
        if (["d", "arrowright"].includes(key) && lastDirection != "left") direction = "right";

        if (!started && !messageShowing && ["w", "s", "d", "arrowup", "arrowdown", "arrowright"].includes(event.key.toLowerCase())) {
            started = true;
            gameLoop = setInterval(update, 1000 / Math.ceil((20 - ((score - 60) ** 2) / 350) - 1));
        }
    });
}

// game over message function
var messageShowing = false;
function message(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("messageContainer").hidden = false;
    document.getElementById("message").innerText = message;
    messageShowing = true;

    document.onkeydown = event => {
        if (event.key == "Enter" || event.key == " ") {
            document.getElementById("messageContainer").hidden = true;
            document.onkeydown = null;
            newGame();
        }
    }

    document.onclick = event => {
        if (event.target.tagName != "CANVAS") {
            document.getElementById("messageContainer").hidden = true;
            document.onclick = null;
            newGame();
        }
    }
}

newGame();