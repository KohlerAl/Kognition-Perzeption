let canvas;
let c;
let currentPoints;
let gameMode;

let imagestoDraw = [];

let startScreenDiv;
let lives = 3;
let elapsedTime = 0;
let isGameOver = false;



let leftSound = new Audio();
let rightSound = new Audio();

let backgroundImage;
let startScreenTextDiv;

isTimeout = false;
let rail2 = new Image();
// Lanes
const LANE = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

const DINOSTATE = {
    WALK: 0,
    CHOMP: 1,
    DEAD: 2
};

let heartImage = new Image();
heartImage.src = './IMG/Heart.png';

let clouds = [];
let trees = [];
let currentLane = LANE.MIDDLE;

let player;

const invaders = [];

window.addEventListener("load", handleLoad);

async function handleLoad() {
    let imgs = await cacheImages(["IMG/Background_2.png", "IMG/Dino_Ham.png", "IMG/Dino_Walk1.png", "IMG/Dino_Walk2.png", "IMG/Tree1.png", "IMG/Tree2.png", "IMG/Tree3.png"]);
    console.log(imgs);
    leftSound.src = "./SOUND/Left.mp3";
    rightSound.src = "./SOUND/Right.mp3";

    startScreenDiv = document.getElementById("start");
    startScreenTextDiv = startScreenDiv.querySelector("p");

    // Get the buttons from the HTML document
    let audioButton = document.getElementById("audioButton");
    let visualButton = document.getElementById("visualButton");
    let letsGoButton = document.getElementById("letsGoButton");

    // Add event listeners to the buttons
    audioButton.addEventListener("click", function () {
        gameMode = "Audio";
        setOverlayText("checking for motion sensors...");
        const deviceMotionPromise = requestDeviceMotion();
 
        Promise.all([deviceMotionPromise])
            .then(() => startScreenDiv.style.display = "none", startGame()) // close start screen (everything is ok)
            .catch((error) => setOverlayError(error)); // display error
    });

    visualButton.addEventListener("click", function () {
        gameMode = "Visual";
        setOverlayText("checking for motion sensors...");
        const deviceMotionPromise = requestDeviceMotion();
 
        Promise.all([deviceMotionPromise])
            .then(() => startScreenDiv.style.display = "none", startGame()) // close start screen (everything is ok)
            .catch((error) => setOverlayError(error)); // display error
    });

    letsGoButton.addEventListener("click", function () {
        letsGoButton.style.display = "none"; // Hide the "Let's go" button
        if (gameMode === "Audio") {
            // Start the game in Audio mode
            // Set the background to black, show the timer and hearts
            startGame("Audio"); // Call the startGame function with "Audio" as argument
        } else if (gameMode === "Visual") {
            // Start the game in Visual mode
            startGame("Visual"); // Call the startGame function with "Visual" as argument
        }
    });


    /* let btn = document.querySelector("button");
    btn.addEventListener("pointerdown", startGame);
    startScreenDiv = document.getElementById("start"); */
    /* 
 
 
    startScreenDiv.style.display = "block";
    startScreenDiv.style.height = window.innerHeight + "px"; 
    //setOverlayText("touch screen to start"); 
 
    btn.addEventListener("pointerdown", () => {
        setOverlayText("checking for motion sensors...");
        const deviceMotionPromise = requestDeviceMotion();
 
        Promise.all([deviceMotionPromise])
            .then(() => startScreenDiv.style.display = "none", startGame()) // close start screen (everything is ok)
            .catch((error) => setOverlayError(error)); // display error
    }); */

}

function startGame() {
    audioButton.style.display = "none"; // Hide the Audio button
    visualButton.style.display = "none"; // Hide the Visual button
    letsGoButton.style.display = "block"; // Show the "Let's go" button

    window.addEventListener("devicemotion", onDeviceMotion);
    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    canvas.style.display = "block";
    let btn = document.querySelector("button");
    btn.style.display = "none";

    // Always show the timer and hearts
    document.getElementById("timer").style.display = "block";
    document.getElementById("lives").style.display = "block";

    // Mode-specific setup
    if (gameMode === "Audio") {
        // Set the background to black, show the timer and hearts
        canvas.style.background = "black";
    } else if (gameMode === "Visual") {
        // Set the background image
        backgroundImage = new Image();
        backgroundImage.src = './IMG/Background_2.png';
        c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);


        // tree in the middle lane
        trees.push(new Tree(300, 210, 1));
        trees.push(new Tree(30, 450, 1));
        trees.push(new Tree(300, 700, 1,));

        // tree in the left lane
        trees.push(new Tree(40, 210, 2));
        trees.push(new Tree(300, 550, 2));
        trees.push(new Tree(10, 700, 2));

        // tree in the right lane
        trees.push(new Tree(300, 110, 3));
        trees.push(new Tree(30, 350, 3));
        trees.push(new Tree(300, 600, 3));

    }

    //REMOVE
    startScreenDiv.style.display = "none";

    // Load the background image once
    backgroundImage = new Image();
    backgroundImage.src = './IMG/Background_2.png';

    c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    rail2.src = './IMG/Rail2.png';

    player = new Player();

    randomInterval();

    window.setInterval(function () {
        animate();
    }, 35)

    window.setInterval(function () {
        currentPoints += 1;
    }, 1000)
}

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.lives = 3;

        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height - 170,
        };
    }

    draw() {
        c.fillStyle = 'red';
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        drawLives();
    }
}

class Invader {
    //declare variables
    velocity;
    state;

    //Get Images for left and right step
    image;
    imageChomp;

    imageLeft;
    imageRight;
    currentImgIsLeft = true;
    counter = 0;
    width;
    height;
    position;
    sound;
    volume;
    audioContext;
    source;
    distortion;
    currentDist = 800;
    filter;
    filterVal = 3000;
    // Add a lane property to the Invader class
    lane;
    constructor(initialLane) {
        this.lane = initialLane;
        this.audioMode = true;

        this.velocity = {
            x: 0,
            y: 1,
        };

        this.image = new Image();
        this.image.src = './IMG/Dino_Walk1.png';

        this.imageChomp = new Image();
        this.imageChomp.src = './IMG/Dino_Ham.png';
        this.state = DINOSTATE.WALK;

        this.imageLeft = document.querySelector("#left");
        this.imageRight = document.querySelector("#right");
        /*  this.imageLeft.src = './IMG/Dino_Walk1.png';
         this.imageRight.src = './IMG/Dino_Walk2.png'; */

        const scale = 0.05;
        this.width = this.image.width * scale;
        this.height = this.image.height * scale;

        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height / 3
        };

        this.sound = new Audio();
        this.sound.src = './SOUND/rawr.mp3';

        this.audioContext = new AudioContext();

        this.source = this.audioContext.createMediaElementSource(this.sound);

        this.volume = this.audioContext.createGain()
        this.volume.gain.value = 0.15;

        this.source.connect(this.volume);
        this.volume.connect(this.audioContext.destination);

        this.distortion = this.audioContext.createWaveShaper();
        this.distortion.connect(this.audioContext.destination);
        this.distortion.curve = this.distortionCurve(this.currentDist);

        this.filter = this.audioContext.createBiquadFilter();

        this.volume.connect(this.filter)
        this.filter.connect(this.audioContext.destination);

        this.filter.type = "lowpass";
        this.filterVal = 0;
        this.filter.frequency.setTargetAtTime(parseFloat(this.filterVal), parseFloat(this.audioContext.currentTime), parseFloat(0));
    }

    draw() {
        if (this.image && this.lane === currentLane && this.state === DINOSTATE.WALK) {
            if (this.currentImgIsLeft) {
                c.drawImage(
                    this.imageLeft,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                );
            }
            else if (!this.currentImgIsLeft) {
                c.drawImage(
                    this.imageRight,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                );
            }
            this.playSound();
        }
        else if (this.imageChomp && this.lane === currentLane && this.state === DINOSTATE.CHOMP) {
            c.drawImage(
                this.imageChomp,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }

        const scale = 1 + (this.position.y / canvas.height) * 0.02;

        this.width = this.width * scale;
        this.height = this.height * scale;

        this.counter++;
        if (this.counter == 20 && this.currentImgIsLeft) {
            this.counter = 0;
            this.currentImgIsLeft = false;
        }
        else if (this.counter == 20 && !this.currentImgIsLeft) {
            this.counter = 0;
            this.currentImgIsLeft = true;
        }

        this.position.x = canvas.width / 2 - this.width / 2;

        if (this.position.x < canvas.width / 4 && this.lane == currentLane) {
            this.state = DINOSTATE.CHOMP;
        }

        if (this.position.x < canvas.width / 6 && this.lane === currentLane) {
            handleCollision();
        }

        if (this.width >= canvas.width) {
            invaders.splice(0, 1);
        }
    }

    playSound() {
        if (gameMode === 'Audio') {
            this.sound.play();
            this.volume.gain.value += 0.01;
            this.currentDist -= 2;
            this.distortion.curve = this.distortionCurve(this.currentDist);
            this.filterVal += 150;
            this.filter.frequency.setTargetAtTime(this.filterVal, this.audioContext.currentTime, 9);
        }
    }

    distortionCurve(amount) {
        const k = typeof amount === "number" ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; i++) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 *
                deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}

class Cloud {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.image = new Image();

        if (type == 1) {
            this.image.src = './IMG/Cloud_1.png';
        }
        else if (type == 2) {
            this.image.src = './IMG/Cloud_2.png';
        }

        this.scale = 0.1;
    }

    draw() {
        c.drawImage(
            this.image,
            this.x,
            this.y,
            this.image.width * this.scale,
            this.image.height * this.scale
        );
    }
}

class Tree {
    type = 0;

    constructor(x, y, type, scale) {
        this.image = new Image();
        this.scale = scale // Adjust this value to change the size of the trees
        if (scale == 0)
            scale = 1;

        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;
        this.type = type;
        this.position = {
            x: x,
            y: y
        };


        if (type == 1) {
            this.image.src = './IMG/Tree1.png';
        }
        else if (type == 2) {
            this.image.src = './IMG/Tree2.png';
        }
        else if (type == 3) {
            this.image.src = './IMG/Tree3.png';
            this.position.y += 100;
        }
    }

    draw() {
        this.width = 100;
        this.height = 200;
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}



function createInvaders() {
    if (invaders.length === 0) {
        const invader = new Invader(currentLane);
        invader.image.onload = function () {
            invaders.push(invader);
        }
    }
}

function randomInterval() {
    let func = function () {
        createInvaders();
        let randomSpawn = 5000 + Math.random() * 10000;
        setTimeout(func, randomSpawn);
    }
    func();
}

function animate() {
    // Clear the canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    if (gameMode === "Audio") {

        // Check if the background image is loaded
        if (backgroundImage.complete) {
            // Calculate source rectangle based on the current lane
            const laneWidth = backgroundImage.width / 3;
            const sourceX = laneWidth * currentLane;
            const sourceY = 0;
            const sourceWidth = laneWidth;
            const sourceHeight = backgroundImage.height;

            // Draw the background for the current lane
            c.drawImage(backgroundImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        }

        if (currentLane == LANE.MIDDLE) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);

        }
        else if (currentLane == LANE.LEFT) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);

        }
        else if (currentLane == LANE.RIGHT) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);

        }

        invaders.forEach((invader) => {
            invader.draw();
        });
        // Fill the canvas with black for the Audio mode
        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);
    } else if (gameMode === "Visual") {
        // Draw preloaded background image for the Visual mode
        c.fillStyle = '#BCE5E7';
        c.fillRect(0, 0, canvas.width, canvas.height);


        // Check if the background image is loaded
        if (backgroundImage.complete) {
            // Calculate source rectangle based on the current lane
            const laneWidth = backgroundImage.width / 3;
            const sourceX = laneWidth * currentLane;
            const sourceY = 0;
            const sourceWidth = laneWidth;
            const sourceHeight = backgroundImage.height;



            /* // Desired height for the background image
            const desiredHeight = 1000; */

            // Draw the background for the current lane
            c.drawImage(backgroundImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        }

        if (currentLane == LANE.MIDDLE) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);
        }
        else if (currentLane == LANE.LEFT) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);
        }
        else if (currentLane == LANE.RIGHT) {
            c.drawImage(rail2, canvas.width / 2 - 125, canvas.height / 2.25, 250, canvas.height);
        }

        trees.forEach((trees) => {
            if (trees.type == 1 && currentLane == LANE.MIDDLE)
                trees.draw();
            else if (trees.type == 2 && currentLane == LANE.LEFT)
                trees.draw();
            else if (trees.type == 3 && currentLane == LANE.RIGHT)
                trees.draw();
        });

        invaders.forEach((invader) => {
            invader.draw();
        });
    }
    elapsedTime += 0.025;
    c.font = "20px Arial";
    c.fillStyle = "white";
    c.fillText("Time: " + Math.floor(elapsedTime) + "s", 10, 60);
    drawLives();
}


addEventListener('keydown', ({ key }) => {
    switch (key) {
        case "a":
            switchLanes("a");
            break;
        case "d":
            switchLanes("d");
            break;
    }
});

function switchLanes(dir) {
    switch (dir) {
        case 'a':
            if (currentLane == LANE.MIDDLE || currentLane == LANE.RIGHT) {
                if (currentLane == LANE.MIDDLE) {
                    currentLane = LANE.LEFT;
                }
                else {
                    currentLane = LANE.MIDDLE;
                }
            }
            if (gameMode === 'Audio') {
                leftSound.play();
            }
            break;
        case 'd':
            if (currentLane == LANE.MIDDLE || currentLane == LANE.LEFT) {
                if (currentLane == LANE.MIDDLE) {
                    currentLane = LANE.RIGHT;
                }
                else {
                    currentLane = LANE.MIDDLE;
                }
            }
            if (gameMode === 'Audio') {
                rightSound.play();
            }
            break;
    }
}

function setOverlayText(text) {
    startScreenTextDiv.classList.remove("error");
    startScreenTextDiv.innerHTML = text;
}

function setOverlayError(text) {
    startScreenTextDiv.classList.add("error");
    startScreenTextDiv.innerHTML = text;
}

let dataStreamTimeout = null;
let dataStreamResolve = null;
let scaleAcc = 1;

function requestDeviceMotion() {
    return new Promise((resolve, reject) => {
        dataStreamResolve = resolve;

        dataStreamTimeout = setTimeout(() => {
            dataStreamTimeout = null;
            reject("no device motion/orientation data streams");
        }, 1000);

        if (DeviceMotionEvent || DeviceOrientationEvent) {
            if (DeviceMotionEvent.requestPermission || DeviceOrientationEvent.requestPermission) {
                DeviceMotionEvent.requestPermission()
                    .then((response) => {
                        if (response == "granted") {
                            window.addEventListener("devicemotion", onDeviceMotion);
                            resolve();
                            scaleAcc = -1;
                        } else {
                            reject("no permission for device motion");
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener("devicemotion", onDeviceMotion);
            }
        } else {
            reject("device motion/orientation not available");
        }
    });
}
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

function requestWebAudio() {
    return new Promise((resolve, reject) => {
        if (AudioContext) {
            audioContext.resume()
                .then(() => resolve())
                .catch(() => reject());
        }
        else {
            reject("web audio not available");
        }
    });
}


const defaultThreshold = 2;
let filterCoeff = null;
let lastFilteredAcc = 0;
let lastDiffAcc = null;
let leftPeak = 0;
let rightPeak = 0;

function onDeviceMotion(e) {
    if (dataStreamTimeout !== null && dataStreamResolve !== null) {
        dataStreamResolve();
        clearTimeout(dataStreamTimeout);
    }
    if (isTimeout)
        return;


    const acc = scaleAcc * e.acceleration.x;
    const currentFilteredAcc = filterCoeff * lastFilteredAcc + (1 - filterCoeff) * acc;
    const currentDiffAcc = currentFilteredAcc - lastFilteredAcc;

    // init filterCoeff with sensor interval
    if (filterCoeff === null) {
        filterCoeff = Math.exp(-2.0 * Math.PI * e.interval / 2);
    }

    // init lastDiffAcc
    if (lastDiffAcc === null) {
        lastDiffAcc = currentDiffAcc;
    }

    if (currentFilteredAcc < -defaultThreshold && lastDiffAcc < 0 && currentDiffAcc >= 0) {
        // register left kick (negative acc minimum)
        leftPeak = currentFilteredAcc;

        // trigger on left kick but not on right stop
        const threshold = Math.min(-defaultThreshold, -0.666 * rightPeak);
        if (currentFilteredAcc < threshold) {
            switchLanes("a");
            isTimeout = true;

            window.setTimeout(function () {
                isTimeout = false;
            }, 500)
        }
    } else if (currentFilteredAcc >= defaultThreshold && lastDiffAcc >= 0 && currentDiffAcc < 0) {
        // register right kick (positive acc maximum)
        rightPeak = currentFilteredAcc;

        // trigger on right kick but not on left stop
        const threshold = Math.max(defaultThreshold, -0.666 * leftPeak);
        if (currentFilteredAcc >= threshold) {
            switchLanes("d");
            isTimeout = true;

            window.setTimeout(function () {
                isTimeout = false;
            }, 500)
        }
    }
    lastFilteredAcc = currentFilteredAcc;
    lastDiffAcc = currentDiffAcc;
}

function handleCollision() {
    if (isGameOver) {
        return;
    }

    player.lives--;
    invaders.splice(0, 1);

    if (player.lives <= 0) {
        gameOver();
    }
    drawLives();
}

function gameOver() {
    isGameOver = true;
    //actions to perform when the game is over
    alert('Game Over!'); // For example, display an alert
    resetGame(); // Reset the game
}

function drawLives() {

    const border = 50; // Adjust this value to change the size of the invisible border
    for (let i = 0; i < player.lives; i++) {
        c.drawImage(heartImage, 10 + i * 30, 30 + border, 20, 20);
    }
}

function resetGame() {
    // Remove existing invaders
    invaders.length = 0;

    // Clear the canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Reset player lives
    player.lives = 3;

    // Reset the timer
    elapsedTime = 0;

    // Additional reset logic here...

    // Restart continuous spawning of invaders
    randomInterval();
}

async function cacheImages(array) {
    if (!cacheImages.list) {
        cacheImages.list = [];
    }
    var list = cacheImages.list;

    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function () {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
                // check if all images are loaded and start the game
                if (list.length === 0) {
                    startGame(gameMode);
                }
            }
            list.push(img);
            img.src = array[i];
        }
    }

    /*  return new Promise((resolve) => {
         console.log(resolve); 
     }); */

    return true;
}