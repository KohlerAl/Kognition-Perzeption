"use strict";
let canvas;
let c;
let currentPoints;
let lives = 3;
let elapsedTime = 0;
let isGameOver = false;
//Lanes 
//enum can only have set values (in this case left, middle, right)
var LANE;
(function (LANE) {
    LANE[LANE["LEFT"] = 0] = "LEFT";
    LANE[LANE["MIDDLE"] = 1] = "MIDDLE";
    LANE[LANE["RIGHT"] = 2] = "RIGHT";
})(LANE || (LANE = {}));
//array to store the clouds (for animation)
//[] = array
let clouds = [];
//set lane to start in (we start in the middle lane)
let currentLane = LANE.MIDDLE;
//the player, stored in a variable for animation
let player;
//array to store the invaders 
const invaders = []; // Array to store multiple invaders
//event listener listening to the load event (load event = everything has been loaded)
window.addEventListener("load", handleLoad);
function handleLoad() {
    let btn = document.querySelector("button");
    btn.addEventListener("pointerdown", startGame);
}
function startGame() {
    //set canvas width and height to window width and height
    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //show canvas and hide button
    canvas.style.display = "block";
    let btn = document.querySelector("button");
    btn.style.display = "none";
    //There has to be a user interaction first to allow sound, so we start the game only after a button was pressed
    //create two clouds
    clouds.push(new Cloud(canvas.width / 3, 100, 1));
    clouds.push(new Cloud(canvas.width / 2, 200, 2));
    //create player
    player = new Player();
    //start contiuesly spawning invaders
    randomInterval();
    //call function animate every 25ms
    window.setInterval(function () {
        animate();
    }, 25);
    window.setInterval(function () {
        currentPoints += 1;
    }, 1000);
}
class Player {
    //declare variables for width, height and position of the player
    width;
    height;
    position;
    lives;
    constructor() {
        this.width = 50; // Set the width of the player
        this.height = 50; // Set the height of the player
        this.lives = 3; // Set the initial number of lives
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height - 170,
        };
    }
    draw() {
        //draw the player
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Draw lives in the UI
        drawLives();
    }
}
class Invader {
    //declare variables
    velocity;
    image;
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
        // Assign the lane when the invader is created
        this.lane = initialLane;
        //walk toward the bottom
        this.velocity = {
            x: 0,
            y: 1,
        };
        console.log(this.lane, initialLane);
        //set Image element to draw the dino
        this.image = new Image();
        this.image.src = './IMG/Dino.png';
        //scale the image
        const scale = 0.05;
        this.width = this.image.width * scale;
        this.height = this.image.height * scale;
        //set the position
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height / 5
        };
        //create new Audio Element and set the source to the rawr sound
        this.sound = new Audio();
        this.sound.src = './SOUND/rawr.mp3';
        //create a new audio context (ussed to add effects)
        this.audioContext = new AudioContext();
        //create a media element source from the audio element we created
        this.source = this.audioContext.createMediaElementSource(this.sound);
        //create a gain element (volume) and set the volume to 20%
        this.volume = this.audioContext.createGain();
        this.volume.gain.value = 0.15;
        //conncet the audio element with the volume and the volume with the audop context
        this.source.connect(this.volume);
        this.volume.connect(this.audioContext.destination);
        //create the distorion node
        this.distortion = this.audioContext.createWaveShaper();
        this.distortion.connect(this.audioContext.destination);
        this.distortion.curve = this.distortionCurve(this.currentDist);
        //create filter 
        this.filter = this.audioContext.createBiquadFilter();
        this.volume.connect(this.filter);
        this.filter.connect(this.audioContext.destination);
        this.filter.type = "lowpass";
        this.filter.frequency.setTargetAtTime(this.filterVal, this.audioContext.currentTime, 0);
    }
    draw() {
        if (this.image && this.lane === currentLane) {
            //draw the dino
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            this.playSound();
        }
        // Scale based on vertical position
        const scale = 1 + (this.position.y / canvas.height) * 0.02;
        //apply scale to width and height 
        this.width = this.width * scale;
        this.height = this.height * scale;
        //make sure dino stays in the middle of the screen
        this.position.x = canvas.width / 2 - this.width / 2;
        if (this.position.x < canvas.width / 4 && this.lane === currentLane) {
            //console.log("collision"); 
            handleCollision(); // Function to handle collision
        }
        //if the dino is wider than the canvas, make it despawn
        if (this.width >= canvas.width) {
            invaders.splice(0, 1);
        }
    }
    playSound() {
        //function to play the sounds
        this.sound.play();
        this.volume.gain.value += 0.01;
        this.currentDist -= 2;
        this.distortion.curve = this.distortionCurve(this.currentDist);
        this.filterVal += 150;
        this.filter.frequency.setTargetAtTime(this.filterVal, this.audioContext.currentTime, 9);
    }
    distortionCurve(amount) {
        const k = typeof amount === "number" ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; i++) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}
/*class Tree { */
// Cloud
class Cloud {
    scale;
    x;
    y;
    image;
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        //depending on the type of the cloud, choose a different image to draw
        if (type == 1) {
            this.image.src = './IMG/Cloud_1.png';
        }
        else if (type == 2) {
            this.image.src = './IMG/Cloud_2.png';
        }
        this.scale = 0.1; // Adjust the scale factor as needed
    }
    draw() {
        c.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
    }
}
function createInvaders() {
    // Function to spawn the dinos
    if (invaders.length === 0) {
        // Create a new invader with the selected lane
        const invader = new Invader(currentLane);
        invaders.push(invader);
        /* invaders.push(new Invader(currentLane)); */
        console.log("hello dino");
    }
}
function randomInterval() {
    //create random intervals and call the createInvaders function to create more dinos
    let func = function () {
        createInvaders();
        let randomSpawn = 5000 + Math.random() * 10000;
        setTimeout(func, randomSpawn);
    };
    func();
}
function handleCollision() {
    // Check if the game is already over
    if (isGameOver) {
        return;
    }
    // Decrease lives
    player.lives--;
    /* // Remove the invader that had a collision
    const index = invaders.indexOf(collidedInvader);
    if (index !== -1) {
        invaders.splice(index, 1);
    } */
    // Display the number of lives in the UI
    drawLives();
    // Set a delay before checking for a game over
    setTimeout(() => {
        // Check if the game is over
        if (player.lives <= 0) {
            gameOver();
        }
    }, 500); // Adjust the delay 
}
function gameOver() {
    isGameOver = true;
    //actions to perform when the game is over
    alert('Game Over!'); // For example, display an alert
    resetGame(); // Reset the game
}
function drawLives() {
    // Display the number of lives in the UI
    c.font = "20px Arial";
    c.fillStyle = "white";
    c.fillText("Lives: " + player.lives, 10, 30);
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
function animate() {
    //change the background color according to the current lane
    if (currentLane == LANE.MIDDLE) {
        c.fillStyle = '#BCE5E7';
    }
    else if (currentLane == LANE.LEFT) {
        c.fillStyle = '#800080';
    }
    else if (currentLane == LANE.RIGHT) {
        c.fillStyle = '#00FF00';
    }
    c.fillRect(0, 0, canvas.width, canvas.height);
    // Draw clouds (because they were drawn over with the background)
    clouds.forEach(cloud => cloud.draw());
    // Draw player
    player.draw();
    invaders.forEach((invader) => {
        // Check if the invader is on the same lane as the player before drawing
        invader.draw();
        elapsedTime += 0.025;
        c.font = "20px Arial";
        c.fillStyle = "white";
        c.fillText("Time: " + Math.floor(elapsedTime) + "s", 10, 60);
    });
    /* // Update all invaders' positions
    invaders.forEach((invader) => {
        invader.draw();
    }); */
}
// Handle keyboard input
// Depending on the pressed key, change the current lane
addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'a':
            if (currentLane == LANE.MIDDLE || currentLane == LANE.RIGHT) {
                if (currentLane == LANE.MIDDLE) {
                    currentLane = LANE.LEFT;
                }
                else {
                    currentLane = LANE.MIDDLE;
                }
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
            break;
    }
});
//# sourceMappingURL=game.js.map