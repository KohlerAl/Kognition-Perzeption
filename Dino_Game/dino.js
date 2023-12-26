let canvas;
let c;
let currentPoints;

let imagestoDraw = [];

let startScreenDiv;
let lives = 3;
let elapsedTime = 0;
let isGameOver = false;

let rail1 = new Image();
let rail2 = new Image();
let rail3 = new Image();
let sun = new Image();
let ground = new Image();
let tree1 = new Image();
let tree2 = new Image();
let tree3 = new Image();

let startScreenTextDiv;

// Lanes
const LANE = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

let clouds = [];

let currentLane = LANE.MIDDLE;

let player;

const invaders = [];

window.addEventListener("load", handleLoad);

function handleLoad() {
    let btn = document.querySelector("button");

    startScreenDiv = document.getElementById("start");
    startScreenTextDiv = startScreenDiv.querySelector("p");


    startScreenDiv.style.display = "block";
    startScreenDiv.style.height = window.innerHeight + "px";
    //setOverlayText("touch screen to start"); 

    btn.addEventListener("pointerdown", () => {
        setOverlayText("checking for motion sensors...");
        const deviceMotionPromise = requestDeviceMotion();

        Promise.all([deviceMotionPromise])
            .then(() => startScreenDiv.style.display = "none", startGame()) // close start screen (everything is ok)
            .catch((error) => setOverlayError(error)); // display error
    });
}

function startGame() {
    window.addEventListener("devicemotion", onDeviceMotion);
    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.display = "block";
    let btn = document.querySelector("button");
    btn.style.display = "none";

    clouds.push(new Cloud(canvas.width / 3, 100, 1));
    clouds.push(new Cloud(canvas.width / 2, 200, 2));

    /* rail1.src = './IMG/Rail1.png'; 
    rail2.src = './IMG/Rail2.png'; 
    rail3.src = './IMG/Rail3.png'; 
    sun.src = './IMG/Sonne_1.png';  */
    /* ground.src = './IMG/Ground.png'; */
    /* tree1.src = './IMG/Tree1.png'; 
    tree2.src = './IMG/Tree2.png'; 
    tree3.src = './IMG/Tree3.png';  */

    /* imagestoDraw = [rail1, rail2, rail3, sun, ground, tree1, tree2, tree3]; 
    console.log(ground) */

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
    constructor(initialLane) {
        this.lane = initialLane;

        this.velocity = {
            x: 0,
            y: 1,
        };

        console.log(this.lane, initialLane);

        this.image = new Image();
        this.image.src = './IMG/Dino.png';

        this.imageLeft = new Image();
        this.imageRight = new Image();
        this.imageLeft.src = './IMG/Dino_Walk1.png';
        this.imageRight.src = './IMG/Dino_Walk2.png';

        const scale = 0.05;
        this.width = this.image.width * scale;
        this.height = this.image.height * scale;

        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height / 5
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
        console.log(this.filterVal, this.audioContext.currentTime);
        this.filter.frequency.setTargetAtTime(parseFloat(this.filterVal), parseFloat(this.audioContext.currentTime), parseFloat(0));
    }

    draw() {
        if (this.image && this.lane === currentLane) {
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

        if (this.position.x < canvas.width / 4 && this.lane === currentLane) {
            handleCollision();
        }

        if (this.width >= canvas.width) {
            invaders.splice(0, 1);
        }
    }

    playSound() {
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

function createInvaders() {
    if (invaders.length === 0) {
        const invader = new Invader(currentLane);

        invaders.push(invader);

        console.log("hello dino");
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
    if (currentLane == LANE.MIDDLE) {
        c.fillStyle = '#BCE5E7';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    else if (currentLane == LANE.LEFT) {
        c.fillStyle = 'red';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    else if (currentLane == LANE.RIGHT) {
        c.fillStyle = 'blue';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }

    clouds.forEach(cloud => cloud.draw());

    invaders.forEach((invader) => {
        invader.draw();
    });

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
    console.log(dir);
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

const defaultThreshold = 4;
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
        console.log("hello a")

        // trigger on left kick but not on right stop
        const threshold = Math.min(-defaultThreshold, -0.666 * rightPeak);
        if (currentFilteredAcc < threshold) {
            switchLanes("a");
        }
    } else if (currentFilteredAcc >= defaultThreshold && lastDiffAcc >= 0 && currentDiffAcc < 0) {
        // register right kick (positive acc maximum)
        rightPeak = currentFilteredAcc;

        console.log("hello d")

        // trigger on right kick but not on left stop
        const threshold = Math.max(defaultThreshold, -0.666 * leftPeak);
        if (currentFilteredAcc >= threshold) {
            switchLanes("d"); 
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

    drawLives();
}

function drawLives() {
    // Display the number of lives in the UI
    c.font = "20px Arial";
    c.fillStyle = "white";
    c.fillText("Lives: " + player.lives, 10, 30);
}