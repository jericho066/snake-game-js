const homeScreen = document.querySelector("#homeScreen");
const settingsScreen = document.querySelector("#settingsScreen");
const unitSizeScreen = document.querySelector("#unitSizeScreen");
const rulesScreen = document.querySelector("#rulesScreen");
const difficultyScreen = document.querySelector("#difficultyScreen");

const profileScreen = document.querySelector("#profileScreen");
const profileBtn = document.querySelector("#profileBtn");
const playerNameInput = document.querySelector("#playerNameInput");
const currentNameDisplay = document.querySelector("#currentNameDisplay");
const saveNameBtn = document.querySelector("#saveNameBtn");

const playBtn = document.querySelector("#playBtn");
const settingsBtn = document.querySelector("#settingsBtn");
const unitSizeSettingBtn = document.querySelector("#unitSizeSettingBtn");

const unitSizeRadios = document.querySelectorAll('input[name="unitSize"]');
const diffBtns = document.querySelectorAll(".diffBtn");
const backBtns = document.querySelectorAll(".backBtn");
const buttons = document.querySelectorAll("button");

const soundsSettingBtn = document.querySelector("#soundsSetting");
const volOnIcon = soundsSettingBtn.querySelector(".on");
const volOffIcon = soundsSettingBtn.querySelector(".off");

const modeBtn = document.getElementById('modeSettings');
const modeDarkIcon = modeBtn.querySelector('.dark');
const modeLightIcon = modeBtn.querySelector('.light');

const resetBtn = document.querySelector("#resetBtn");
const backToDifficultyBtn = document.querySelector("#backToDifficultyBtn");
const homeBtn = document.querySelector("#homeBtn")

const gameContainer = document.querySelector('#gameContainer');
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const poisonTimerDiv = document.querySelector('#poisonFoodTime')
const grapesTimerDiv = document.querySelector('#grapesPowerUpTime');
const orangeTimerDiv = document.querySelector('#orangePowerUpTime');
const poisonText = poisonTimerDiv.querySelector('.powerUpText');
const grapesText = grapesTimerDiv.querySelector('.powerUpText');
const orangeText = orangeTimerDiv.querySelector('.powerUpText');

const scoreText = document.querySelector("#scoreText");
const highScoreText = document.querySelector("#highScoreText");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

//* back up colors if the images are not loaded.
const bgColor = "white";
const snakeColor = "#6d8be8";
const snakeBorder = "black";
const foodColor = "red";

let running = false;
let unitSize = 28;
let dx = unitSize;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let directionChanged = false;
let soundsOn = true;
let applesEaten = 0;
let pendingGrowth = 0;
let pulseTime = 0;
let foods = [];
let maxFood;
const floatingTexts = [];

let gameSpeed = 110;
let currentDifficulty = 'easy';
let highScoreKey = `snakeHighScore_${currentDifficulty}_${unitSize}`;
// localStorage.removeItem(highScoreKey);
let highScore = Number(localStorage.getItem(highScoreKey) || 0);

let scoreSubmitted = false;

//* backend API for scores
const SCORES_API = 'http://localhost:3000/scores';

//* power ups
let grapesPowerActive = false;
let doubleScoreTimer = 0;
let orangePowerActive = false;
let invincibilityTime = 0;
let poisonActive = false
let poisonTimer = 0;


//* sound effects.
const eatSound = new Audio("assets/sounds/SnakeEat.wav");
const pointSound = new Audio("assets/sounds/point.ogg");
const dieSound = new Audio("assets/sounds/SnakeDie.wav");
const clickSound = new Audio("assets/sounds/ButtonClick.wav");
const moveSound = new Audio("assets/sounds/SnakeMove.wav");
const hoverSound = new Audio("assets/sounds/ButtonOver.wav");

//* foods sprites.
const appleImg = new Image();
appleImg.src = "assets/sprites/foods/food_apple.png";

const orangeImg = new Image();
orangeImg.src = "assets/sprites/foods/food_orange.png";

const bananaImg = new Image();
bananaImg.src = "assets/sprites/foods/food_banana.png";

const grapesImg = new Image();
grapesImg.src = "assets/sprites/foods/food_grapes.png";

const poisonImg = new Image();
poisonImg.src = "assets/sprites/foods/food_poison.png"


const snakeImgs = {
    head: {
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image()
    },
    tail: {
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image()
    },
    body: {
        horizontal: new Image(),
        vertical: new Image(),
        topLeft: new Image(),
        topRight: new Image(),
        bottomLeft: new Image(),
        bottomRight: new Image()
    }
};

//* snake sprites
snakeImgs.head.up.src = "assets/sprites/snake/head_up.png";
snakeImgs.head.down.src = "assets/sprites/snake/head_down.png";
snakeImgs.head.left.src = "assets/sprites/snake/head_left.png";
snakeImgs.head.right.src = "assets/sprites/snake/head_right.png";

snakeImgs.tail.up.src = "assets/sprites/snake/tail_up.png";
snakeImgs.tail.down.src = "assets/sprites/snake/tail_down.png";
snakeImgs.tail.left.src = "assets/sprites/snake/tail_left.png";
snakeImgs.tail.right.src = "assets/sprites/snake/tail_right.png";

snakeImgs.body.horizontal.src = "assets/sprites/snake/body_horizontal.png";
snakeImgs.body.vertical.src = "assets/sprites/snake/body_vertical.png";
snakeImgs.body.topLeft.src = "assets/sprites/snake/body_topleft.png";
snakeImgs.body.topRight.src = "assets/sprites/snake/body_topright.png";
snakeImgs.body.bottomLeft.src = "assets/sprites/snake/body_bottomleft.png";
snakeImgs.body.bottomRight.src = "assets/sprites/snake/body_bottomright.png";


//!! BACKEND INTEGRATION FUNCTION

//* connecting into server for backend
const submitScore = async () => {
    const playerName = localStorage.getItem('playerName') || "Anonymous";

    const payload = {
        name: playerName,
        score: score,
        difficulty: currentDifficulty,
        unitSize: unitSize
    };

    try {
        //* send score to the backend server.
        const res = await fetch(SCORES_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.warn('Failed to submit score, status:', res.status);
            return;
        }

        const data = await res.json();
        console.log('Score submitted:', data);
    } catch (err) {
        console.error('Error submitting score:', err);
    }
}

const getPlayerName = () => {
    const savedName = localStorage.getItem('playerName') || "Anonymous";
    currentNameDisplay.textContent = savedName;
    playerNameInput.value = savedName;
    return savedName;
}

const savePlayerName = () => {
    const newName = playerNameInput.value.trim();
    
    if (newName === "") {
        alert("Please enter a valid name!");
        return;
    }
    
    if (newName.length > 20) {
        alert("Name must be 20 characters or less!");
        return;
    }
    
    try {
        localStorage.setItem('playerName', newName);
        currentNameDisplay.textContent = newName;
        
        clickSound.currentTime = 0;
        clickSound.play();
        
        // Show success feedback
        saveNameBtn.textContent = "Saved!";
        setTimeout(() => {
            saveNameBtn.textContent = "Save Name";
        }, 1500);
        
    } catch (error) {
        console.error('Error saving name:', error);
        alert("Error saving name. Please try again.");
    }
}


//! GAME FUNCTIONS

const snakePart = (tileX, tileY) => {
    return {
        x: tileX * unitSize,
        y: tileY * unitSize,
        growingFade: 0
    };
}
//* snake set up starting on 5 segments.
let snake = [
    snakePart(4, 0),
    snakePart(3, 0),
    snakePart(2, 0),
    snakePart(1, 0),
    snakePart(0, 0),
];

const spawnFood = (animate = true, forceType = null) => {
    let food;
    let overlapping;
    
    do {
        overlapping = false;

        //* generate random position on the grid
        const tileX = Math.floor(Math.random() * (gameWidth / unitSize));
        const tileY = Math.floor(Math.random() * (gameHeight / unitSize));

        
        let type = forceType || "apple";

        food = {
            x: tileX * unitSize,
            y: tileY * unitSize,
            spawnScale: animate ? 0.1 : 1.0,
            type
        }

        // to make sure the food doesn't overlap with the snake.
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                overlapping = true;
                break;
            }
        }

        // to make sure the food doesn't overlap with the existing food.
        for (let f of foods) {
            if (f.x === food.x && f.y === food.y) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);

    foods.push(food);
}

const drawFood = () => {
    for (let food of foods) {
        //* food spawn animation.
        if (food.spawnScale < 1) {
            food.spawnScale += 0.25;
            if (food.spawnScale > 1) {
                food.spawnScale = 1;
            };
        }
        
        //* rendering properties calculations.
        let scale = food.spawnScale;
        let size = (unitSize * scale) * 1.5
        const midX = food.x + unitSize / 2;
        const midY = food.y + unitSize / 2;
        const x = midX - size / 2;
        const y = midY - size / 2;

        //* shadow effects 
        ctx.save();
        ctx.shadowColor= "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        //* pulsing animation indicates special power-up status and draws attention
        const foodPulse = () => {
            const pulse = 1 + Math.sin((pulseTime + food.x) * 4) * 0.1;
            scale = food.spawnScale * pulse;
            size = (unitSize * scale) * 1.5;
        }

        //* different foods need distinct visual representation to communicate their effects.
        if (food.type == "orange") {
            foodPulse();

            if (orangeImg.complete) {
                ctx.drawImage(orangeImg, x, y, size, size);
            } else {
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(midX, midY, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

        }else if (food.type === "banana") {
            foodPulse();

            if (bananaImg.complete) {
                ctx.drawImage(bananaImg, x, y, size, size);
            } else {
                ctx.fillStyle = "yelow";
                ctx.beginPath();
                ctx.arc(midX, midY, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

        } else if(food.type === "grapes") {
            foodPulse();

            if (grapesImg.complete) {
                ctx.drawImage(grapesImg, x, y, size, size);
            } else {
                ctx.fillStyle = "purple";
                ctx.beginPath();
                ctx.arc(midX, midY, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (food.type === "poison") {
            foodPulse()

            if (poisonImg.complete) {
                ctx.drawImage(poisonImg, x, y, size, size);
            } else {
                ctx.fillStyle = "#550000";
                ctx.beginPath();
                ctx.arc(midX, midY, size/2, 0, Math.PI*2);
                ctx.fill();
            } 
        } else {
            if (appleImg.complete) {
                ctx.drawImage(appleImg, x, y, size, size);
            } else {
                ctx.fillStyle = foodColor;
                ctx.beginPath();
                ctx.arc(midX, midY, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

const updateMaxFood = () => {
    switch (unitSize) {
        case 28:
            maxFood = 3;
            break;
        case 20:
            maxFood = 4;
            break;
        case 15:
            maxFood = 5;
            break;
        
    }
}

const updateScore = (newScore)=> {
    scoreText.textContent= `${newScore}`;
    highScoreText.textContent = `${highScore}` 
}

const updateFloatingText= () => {
    //* animate score popups to provide satisfying visual feedback for player actions.
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.5;
        ft.opacity -= 0.03;
        ft.lifetime--;

        if (ft.opacity <= 0 || ft.lifetime <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

const drawFloatingText = () => {
    floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.opacity;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "#ffffff";
        
        const size = ft.fontSize || 15;
        ctx.font = `bold ${size}px 'Press Start 2P'`;

        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    })
}

const updateSnake = () => {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    //* snake and food collision logics.
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];

        //* if food is eaten
        if(snake[0].x === food.x && snake[0].y === food.y) {
            foods.splice(i, 1);

            let forceType = null;
            let points;

            
            //* determine points based on food type.
            switch (food.type) {
                case "orange": points = 5; break;
                case "banana": points = 3; break;
                case "grapes": points = 10; break;
                default: points = 1; break;
            }

            //* points doubled if the grapes are eaten.
            if (grapesPowerActive) {
                points *= 2;
            }

            score += points;
            pendingGrowth++;
            updateScore(score);

            if (food.type === "apple") {
                applesEaten++; 

                if (grapesPowerActive) {
                    floatingTexts.push({
                    text: `+${points}`,
                    x: food.x + unitSize / 2,
                    y: food.y + unitSize / 2,
                    opacity: 1,
                    lifetime: 30
                })

                    pointSound.currentTime = 0;
                    pointSound.play();
                    
                }

                //* power up foods spawning based on how many apples are eaten.
                if (applesEaten % 5 ===0) {
                    forceType = "banana";  // 5 apples
                }else if(applesEaten % 8 === 0) {
                    forceType = "orange";  // 8 apples
                }else if(applesEaten % 18 === 0) {
                    forceType = "grapes";  // 18 apples
                }

                //* poison spawning every 15 apples are eaten
                //! spawn multiple poison foods temporarily
                if (applesEaten % 15 === 0) {
                    let poisonDuration;

                    if (unitSize === 28) {
                        poisonDuration = 5000;
                    } else if (unitSize === 20) {
                        poisonDuration = 8000;
                    } else {
                        poisonDuration = 10000;
                    }
                    
                    for (let i =0; i < maxFood; i++) {
                        spawnFood(true, "poison")
                    }
                    setTimeout(() => {
                        foods = foods.filter(f => f.type !== "poison");
                    }, poisonDuration)
                }
            }

            //* forcing the type of food spawning, exept for the poison food.
            if (food.type !== "poison") {
                spawnFood(true, forceType);
            }

            //* power up foods conditions, what will happens if eaten. 
            if (food.type === "orange") {
                orangePowerActive = true;
                
                if (unitSize === 28) {
                    invincibilityTime = 5.0;
                } else if (unitSize === 20) {
                    invincibilityTime = 8.0;
                } else {
                    invincibilityTime = 10.0
                }

                orangeTimerDiv.classList.remove('hidden');
                orangeText.textContent = `Invincible: ${invincibilityTime.toFixed(1)}s`
                

                floatingTexts.push({
                    text: `+${points}`,
                    x: food.x + unitSize / 2,
                    y: food.y + unitSize / 2,
                    opacity: 1,
                    lifetime: 30
                })

                pointSound.currentTime = 0;
                pointSound.play();
                eatSound.currentTime = 0;
                eatSound.play();
            } else if(food.type === "banana") {
                //* make the snake shrink into 3 segments if the banana is eaten.
                if (unitSize === 28) {
                    for (let k = 0; k < 4; k++) {
                        if (snake.length > 1) {
                            snake.pop();
                        }
                    }
                } else if (unitSize === 20) {
                    for (let k = 0; k < 3; k++) {
                        if (snake.length > 1) {
                            snake.pop();
                        }
                    }
                } else {
                    for (let k = 0; k < 2; k++) {
                        if (snake.length > 1) {
                            snake.pop();
                        }
                    }
                }

                floatingTexts.push({
                    text: `+${points}`,
                    x: food.x + unitSize / 2,
                    y: food.y + unitSize / 2,
                    opacity: 1,
                    lifetime: 30
                })

                pointSound.currentTime = 0;
                pointSound.play();
                eatSound.currentTime = 0;
                eatSound.play();

            } else if (food.type === "grapes") {
                grapesPowerActive = true;

                if (unitSize === 28) {
                    doubleScoreTimer = 5.0;
                } else if (unitSize ===20) {
                    doubleScoreTimer = 8.0;
                } else {
                    doubleScoreTimer = 10.0;
                }
            
                grapesTimerDiv.classList.remove('hidden');
                grapesText.textContent = `×2 Score: ${doubleScoreTimer.toFixed(1)}`


                floatingTexts.push({
                    text: `+${points}`,
                    x: food.x + unitSize / 2,
                    y: food.y + unitSize / 2,
                    opacity: 1,
                    lifetime: 30
                })

                pointSound.currentTime = 0;
                pointSound.play();
                eatSound.currentTime = 0;
                eatSound.play();

            } else if (food.type === "poison") {
                poisonActive = true;
                poisonTimer = 5.0;

                poisonTimerDiv.classList.remove("hidden");
                poisonTimerDiv.querySelector(".powerUpIcon").src = poisonImg.src;
                poisonTimerDiv.querySelector(".powerUpText").textContent = `Poison: ${poisonTimer.toFixed(1)}s`;

                floatingTexts.push({
                    text: `POISONED!`,
                    x: food.x + unitSize / 2,
                    y: food.y + unitSize / 2,
                    opacity: 1,
                    lifetime: 30,
                    fontSize: 8
                })

                dieSound.currentTime = 0;
                dieSound.play();
                
            } else {
                eatSound.currentTime = 0;
                eatSound.play();
            }            
            break;
        } 
    }

    //* snake growth logic
    if (pendingGrowth > 0) {
        if (snake.length > 1) {
            snake[1].growingFade = 10;
        }
        pendingGrowth--;
    } else {
        snake.pop();
    }

    directionChanged = false;
}

const drawSnake = () => {
    let headPart, headPrev, headNext, headImg;

    if (orangePowerActive) {
        headPart = snake[0];
        headPrev = null;
        headNext = snake[1];

        //*switching the head sprites position dipending on which direction the snake is moving.
        if (dx === unitSize) {
            headImg = snakeImgs.head.right;
        } else if (dx === -unitSize) {
            headImg = snakeImgs.head.left;
        } else if (dy === unitSize) {
            headImg = snakeImgs.head.down;
        } else if (dy === -unitSize) {
            headImg = snakeImgs.head.up;
        }

        //* snake drawing logic if the snake ate the orange.
        //! ORANGE FOOD GRANTS THE SNAKE AN INVINCIBILITY, WHERE IT CANNOT DIE IF IT COLLIDES WITH ITS BODY.
        for (let i = 1; i < snake.length; i++) {
            const part = snake[i];
            const prev = snake[i - 1];
            const next = snake[i + 1];
            let image;

            //* circle growing animation when the snake ate food.
            if (part.growingFade && part.growingFade > 5) {
                let fade = part.growingFade / 10;
                let size = unitSize * (1 + 0.5 * fade);
                let midX = part.x + unitSize / 2;
                let midY = part.y + unitSize / 2;
                let radius = size;

                const gradient = ctx.createRadialGradient(midX, midY, 2, midX, midY, radius / 2);
                gradient.addColorStop(0, "#6d8be8");
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(midX, midY, radius / 2, 0, Math.PI * 2);
                ctx.fill();

                part.growingFade--;
                if (part.growingFade <= 0) {
                    delete part.growingFade;
                } 
            }

            if (i === snake.length - 1) {
                const tailDir = getDirection(prev, part);
                image = snakeImgs.tail[tailDir];
            } else {
                const dirPrev = getDirection(part, prev);
                const dirNext = getDirection(part, next);

                if (
                    (dirPrev === "left" && dirNext === "right") || 
                    (dirPrev === "right" && dirNext === "left")
                ) {
                    image = snakeImgs.body.horizontal;

                } else if (
                    (dirPrev === "up"   && dirNext === "down") || 
                    (dirPrev === "down" && dirNext === "up")
                ) {
                    image = snakeImgs.body.vertical;
                } else {
                    image = getCornerImage(dirPrev, dirNext);
                }
            }

            if (image && image.complete) {
                ctx.drawImage(image, part.x, part.y, unitSize, unitSize);
            } else {
                ctx.fillStyle = snakeColor;
                ctx.fillRect(part.x, part.y, unitSize, unitSize);
            }
        }

        if (headImg && headImg.complete) {
            ctx.drawImage(headImg, headPart.x, headPart.y, unitSize, unitSize);
        } else {
            ctx.fillStyle = snakeColor;
            ctx.fillRect(headPart.x, headPart.y, unitSize, unitSize);
        }

    } else {
        //* snake drawing logic if the snake don't eat orange.
        for (let i = 0; i < snake.length; i++) {
            const part = snake[i];
            const prev = snake[i - 1];
            const next = snake[i + 1];
            let image;

            //* circle growing animation when the snake ate food
            if (part.growingFade && part.growingFade > 5) {
                let fade = part.growingFade / 10;
                let size = unitSize * (1 + 0.5 * fade);
                let midX = part.x + unitSize / 2;
                let midY = part.y + unitSize / 2;
                let radius = size;

                const gradient = ctx.createRadialGradient(midX, midY, 2, midX, midY, radius / 2);
                gradient.addColorStop(0, "#6d8be8");
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(midX, midY, radius / 2, 0, Math.PI * 2);
                ctx.fill();

                part.growingFade--;
                if (part.growingFade <= 0) {
                    delete part.growingFade;
                } 
            }

            //* switching whole snake body sprites positions dipending on the snake direction.
            if (i === 0) {
                // head
                if (dx === unitSize) image = snakeImgs.head.right;
                else if (dx === -unitSize) image = snakeImgs.head.left;
                else if (dy === unitSize) image = snakeImgs.head.down;
                else if (dy === -unitSize) image = snakeImgs.head.up;
            } else if (i === snake.length - 1) {
                // tail
                const tailDir = getDirection(prev, part);
                image = snakeImgs.tail[tailDir];
            } else {
                // body
                const dirPrev = getDirection(part, prev);
                const dirNext = getDirection(part, next);

                if (
                    (dirPrev === "left" && dirNext === "right") || 
                    (dirPrev === "right" && dirNext === "left")
                ) {
                    image = snakeImgs.body.horizontal;

                } else if (
                    (dirPrev === "up" && dirNext === "down") || 
                    (dirPrev === "down" && dirNext === "up")
                ) {
                    image = snakeImgs.body.vertical;

                } else {
                    image = getCornerImage(dirPrev, dirNext);
                }
            }

            if (image && image.complete) {
                ctx.drawImage(image, part.x, part.y, unitSize, unitSize);
            } else {
                ctx.fillStyle = snakeColor;
                ctx.fillRect(part.x, part.y, unitSize, unitSize);
            }
        }
    }
}

const drawBackground= () => {
    const rows = gameHeight / unitSize;
    const cols = gameWidth / unitSize;

    //* green background grid drawing, representing a grass like field.
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const isLight = (row + col) % 2 === 0;
            ctx.fillStyle = isLight ? "#a7d88c" : "#c0eb9e";
            ctx.fillRect(col * unitSize, row * unitSize, unitSize, unitSize)
        }
    }
}

const getDirection = (from, to) => {
    if (from.x < to.x) return "right";
    if (from.x > to.x) return "left";
    if (from.y < to.y) return "down";
    if (from.y > to.y) return "up";
}

const getCornerImage = (dir1, dir2) => {
    const dirs = [dir1, dir2].sort().join("_");

    switch (dirs) {
        case "down_left":
        case "left_down":
            return snakeImgs.body.bottomLeft;
        case "down_right":
        case "right_down":
            return snakeImgs.body.bottomRight;
        case "up_left":
        case "left_up":
            return snakeImgs.body.topLeft;
        case "up_right":
        case "right_up":
            return snakeImgs.body.topRight;
    }
}

const changeDirection = (event) => {
    if (!running) return;
    if (directionChanged) return;

    let key = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const movingUp = (dy == -unitSize);
    const movingDown = (dy == unitSize);
    const movingRight = (dx == unitSize);
    const movingLeft = (dx == -unitSize);

    const head = snake[0];
    let nextX = head.x;
    let nextY = head.y;

    if (poisonActive) {
        //* making the controls inverted if the snake ate the poison.
        if (key === 37) {
            key = 39
        } else if (key === 39) {
            key = 37
        }else if (key === 38) {
            key = 40
        }else if (key === 40) {
            key = 38;
        }
    }
    

    switch (key) {
        case LEFT:
            if (movingRight) return;
            nextX = head.x - unitSize;
            break;
        case UP:
            if (movingDown) return;
            nextY = head.y - unitSize;
            break;
        case RIGHT:
            if (movingLeft) return;
            nextX = head.x + unitSize;
            break;
        case DOWN:
            if (movingUp) return;
            nextY = head.y + unitSize;
            break;
        default:
            return;
    }

    //* check if the snake hits the edge of the board.
    if (
        nextX < 0 ||
        nextY < 0 ||
        nextX >= gameWidth ||
        nextY >= gameHeight
    ) {
        running = false;
        showGameOver();
        return;
    }

    //* check if thw snake hits the body.
    if (!orangePowerActive) {
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === nextX && snake[i].y === nextY) {
                running = false;
                showGameOver();
                return;
            }
        }
    }

    

    moveSound.currentTime = 0;
    moveSound.play();

    dx = nextX - head.x;
    dy = nextY - head.y;
    directionChanged = true;
}

const checkGameOver = () => {
    switch(true) {
        case (snake[0].x < 0):
            running = false;
            break;
        case (snake[0].x >= gameWidth):
            running = false;
            break;
        case (snake[0].y < 0):
            running = false;
            break;
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }


    if (!orangePowerActive) {
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
                running = false;
            }
        }
    }
}

const showGameOver = () => {
    dieSound.currentTime = 0;
    dieSound.play();

    const text = "GAME OVER!";
    const textSize = 24;

    ctx.font = `${textSize}px 'Press Start 2P',cursive`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 4;

    const x = gameWidth / 2;
    const y = gameHeight / 2

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    //* submit the score into the database
    if (!scoreSubmitted) {
        scoreSubmitted = true;
        submitScore();
    }

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    resetBtn.style.display = "block";
    homeBtn.style.display = "block";
    backToDifficultyBtn.style.display = "block";
    // running = false;
}

const gameLoop = () => {
    pulseTime += 0.05; 
    
    if (orangePowerActive) {
        invincibilityTime -= gameSpeed / 1000;
        if (invincibilityTime <= 0) {
            orangePowerActive = false;
            orangeTimerDiv.classList.add('hidden');
        } else {
            orangeText.textContent = `Invincible: ${invincibilityTime.toFixed(1)}s`
        }
    }
    
    if (grapesPowerActive) {
        doubleScoreTimer -= gameSpeed / 1000;
        if (doubleScoreTimer <= 0) {
            grapesPowerActive = false;
            grapesTimerDiv.classList.add('hidden');
        } else {
            grapesText.textContent = `×2 Score: ${doubleScoreTimer.toFixed(1)}s`
        }
    }

    if (poisonActive) {
        poisonTimer -= gameSpeed / 1000;
        if (poisonTimer <= 0) {
            poisonActive = false;
            poisonTimerDiv.classList.add("hidden");
        } else {
            poisonTimerDiv.querySelector(".powerUpText").textContent = `Poison: ${poisonTimer.toFixed(1)}s`;
        }
    }
    
    if(running) {
        setTimeout(() => {
            drawBackground();
            drawSnake();
            updateSnake();
            drawFood();
            updateFloatingText();
            drawFloatingText();
            checkGameOver();
            gameLoop();
        }, gameSpeed);
    } else {
        showGameOver();
    }
}

const gameStart = () => {
    running = true;
    updateScore(score);
    updateMaxFood();
    
    foods = [] ;
    for (let i = 0; i < maxFood; i++) {
        spawnFood(false);
    }

    drawFood();
    gameLoop();
}

const resetGame = () => {
    scoreSubmitted = false;

    clickSound.currentTime = 0;
    clickSound.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem(highScoreKey, highScore);
    }

    orangePowerActive = false;
    invincibilityTime = 0;
    orangeTimerDiv.classList.add('hidden');

    grapesPowerActive = false;
    doubleScoreTimer = 0;
    grapesTimerDiv.classList.add('hidden');

    poisonActive = false;
    poisonTimer = 0;
    poisonTimerDiv.classList.add('hidden');
    

    resetBtn.style.display = "none";
    homeBtn.style.display = "none";
    backToDifficultyBtn.style.display = "none";

    floatingTexts.length = 0;
    score = 0;
    dx = unitSize;
    dy = 0;
    applesEaten = 0;
    snake = [
        snakePart(4, 0),
        snakePart(3, 0),
        snakePart(2, 0),
        snakePart(1, 0),
        snakePart(0, 0),
    ];
    gameStart();
}


const getSounds = () => {
    const saveSoundSettings = localStorage.getItem("snakesoundsOnd");

    if (saveSoundSettings !== null) {
        soundsOn = saveSoundSettings === "true";
    }

    //* apply the setting to all sound effects
    [eatSound, pointSound, dieSound, clickSound, moveSound, hoverSound].forEach(sfx => {
        sfx.muted = !soundsOn;
    });

    volOnIcon.classList.toggle("hidden", !soundsOn);
    volOffIcon.classList.toggle("hidden", soundsOn);
}

const getBoardSize = () => {
    const savedUnitSize = localStorage.getItem("snakeUnitSize");

    if (savedUnitSize !== null) {
        unitSize = parseInt(savedUnitSize, 10);

        const radioToCheck = document.querySelector(`input[name="unitSize"][value="${unitSize}"]`);
        if (radioToCheck) {
            radioToCheck.checked = true
        }

        highScoreKey = `snakeHighScore_${currentDifficulty}_${unitSize}`;
        highScore = Number(localStorage.getItem(highScoreKey || 0));
        updateMaxFood();
    }
}

const setTheme = (mode) => {
    const isLight = (mode === 'light');
    document.body.classList.toggle('light-mode', isLight);

    const modeText = modeBtn.querySelector(".mode-text");

    //* show/hide icons
    modeDarkIcon.classList.toggle('hidden', isLight);
    modeLightIcon.classList.toggle('hidden', !isLight);

    //* show/hide mode text
    if (isLight) {
        modeText.textContent = "Light Mode";
    } else {
        modeText.textContent = "Dark Mode";
    }

    // aria for screen readers
    modeBtn.setAttribute('aria-pressed', String(isLight));
}


//!! EVENT LISTENERS BELOW.

// buttons at home screen
playBtn.addEventListener('click', () => {
    clickSound.play();
    homeScreen.style.display = 'none';
    difficultyScreen.style.display = 'flex';
});

settingsBtn.addEventListener('click', () => {
    clickSound.play();
    homeScreen.style.display = 'none';
    settingsScreen.style.display = 'flex';
});

rulesBtn.addEventListener('click', () => {
    clickSound.play();
    homeScreen.style.display = 'none';
    rulesScreen.style.display = 'flex';
});


// buttons on second screen
diffBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        clickSound.play();
        gameSpeed = parseInt(e.currentTarget.dataset.speed, 10);

        currentDifficulty = e.currentTarget.dataset.diff;
        highScoreKey = `snakeHighScore_${currentDifficulty}_${unitSize}`

        highScore = Number(localStorage.getItem(highScoreKey) || 0);
        highScoreText.textContent = `High Score: ${highScore}`

        applesEaten = 0;

        difficultyScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        resetGame();
    });
})


soundsSettingBtn.addEventListener('click', () => {
    soundsOn = !soundsOn;

    [eatSound, pointSound, dieSound, clickSound, moveSound, hoverSound].forEach(sfx => sfx.muted = !soundsOn);
    volOnIcon.classList.toggle("hidden", !soundsOn);
    volOffIcon.classList.toggle("hidden", soundsOn);

    try {
        localStorage.setItem("snakesoundsOnd", soundsOn.toString());
    } catch (e) {
        console.warn("Could not save sound setting to localStorage");
    }
})

unitSizeSettingBtn.addEventListener('click', () => {
    clickSound.play();
    settingsScreen.style.display = 'none';
    unitSizeScreen.style.display = 'flex';
})

unitSizeRadios.forEach(radio => {
    radio.addEventListener('click', e => {
        if (!e.target.checked) return;

        clickSound.play();
        unitSize = Number(e.target.value);

        highScoreKey = `snakeHighScore_${currentDifficulty}_${unitSize}`

        highScore = Number(localStorage.getItem(highScoreKey) || 0);
        highScoreText.textContent = `High Score: ${highScore}`;

        // localStorage.getItem()

        updateMaxFood();

        try {
            localStorage.setItem("snakeUnitSize", unitSize.toString());
        } catch (e) {}
    });
})

// gameStart();
resetBtn.addEventListener("click", resetGame);
window.addEventListener("keydown", changeDirection);


backToDifficultyBtn.addEventListener('click', () => {
    clickSound.play();
    running = false;

    gameContainer.style.display = "none";
    resetBtn.style.display = "none";
    homeBtn.style.display = "none"
    backToDifficultyBtn.style.display = "none"
    difficultyScreen.style.display = "flex"
})

homeBtn.addEventListener('click', () => {
    clickSound.play();
    running = false;


    if (score > highScore) {
        highScore = score;
        localStorage.setItem(highScoreKey, highScore);
    }

    gameContainer.style.display = "none";
    resetBtn.style.display = "none";
    homeBtn.style.display = "none";
    homeScreen.style.display = "flex";

    score = 0;
    dx = unitSize;
    dy= 0;
    snake = [
        snakePart(4, 0),
        snakePart(3, 0),
        snakePart(2, 0),
        snakePart(1, 0),
        snakePart(0, 0),
    ];
})

backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clickSound.play();
    running = false;

    settingsScreen.style.display = "none";
    rulesScreen.style.display = "none"
    unitSizeScreen.style.display = "none";
    difficultyScreen.style.display = "none";
    profileScreen.style.display = "none"

    homeScreen.style.display = "flex";
    
  });
});

buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play();
    })
})


modeBtn.addEventListener('click', () => {
    const currentlyLight = document.body.classList.contains('light-mode');
    const newMode = currentlyLight ? 'dark' : 'light';
    setTheme(newMode);
    try {
        localStorage.setItem('snakeTheme', newMode);
    } catch (e) {
    
    }

    // small feedback sound when toggling
    if (typeof clickSound !== 'undefined') {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => { });
    }
});
setTheme(localStorage.getItem('snakeTheme') || 'dark');
getSounds();
getBoardSize();


profileBtn.addEventListener('click', () => {
    clickSound.play();
    settingsScreen.style.display = "none";
    profileScreen.style.display = "flex";
    getPlayerName();
})

saveNameBtn.addEventListener('click', savePlayerName);

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        savePlayerName();
    }
})

playerNameInput.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length > 20) {
        e.target.value = value.substring(0, 20);
    }
})

document.addEventListener('DOMContentLoaded', () => {
    getPlayerName();
})

