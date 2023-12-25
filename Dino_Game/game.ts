let canvas: HTMLCanvasElement;
let c: CanvasRenderingContext2D;
let currentPoints: number;

let imagestoDraw: HTMLImageElement[] = [];

let startScreenDiv: HTMLDivElement;
let lives: number = 3;
let elapsedTime: number = 0;
let isGameOver: boolean = false;

let rail1 = new Image();
let rail2 = new Image();
let rail3 = new Image();
let sun = new Image();
let ground = new Image();
let tree1 = new Image();
let tree2 = new Image();
let tree3 = new Image();

//Lanes 
//enum can only have set values (in this case left, middle, right)
enum LANE {
    LEFT,
    MIDDLE,
    RIGHT
}

//array to store the clouds (for animation)
//[] = array
let clouds: Cloud[] = [];

//set lane to start in (we start in the middle lane)
let currentLane: LANE = LANE.MIDDLE;

//the player, stored in a variable for animation
let player: Player;

//array to store the invaders 
const invaders: Invader[] = []; // Array to store multiple invaders

//event listener listening to the load event (load event = everything has been loaded)
window.addEventListener("load", handleLoad);

function handleLoad(): void {
    let btn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("button");
    btn.addEventListener("pointerdown", startGame);

    startScreenDiv = document.getElementById("start") as HTMLDivElement;

    /* startScreenDiv.style.display = "block";
    startScreenDiv.style.height = window.innerHeight + "px"; 
    setOverlayText("touch screen to start"); */

    /* startScreenDiv.addEventListener("click", () => {
        setOverlayText("checking for motion sensors...");
        const deviceMotionPromise = requestDeviceMotion();

        Promise.all([deviceMotionPromise])
            .then(() => startScreenDiv.style.display = "none") // close start screen (everything is ok)
            .catch((error) => setOverlayError(error)); // display error
    }); */
}


function startGame(): void {
    //set canvas width and height to window width and height
    canvas = <HTMLCanvasElement>document.querySelector('canvas');
    c = <CanvasRenderingContext2D>canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //show canvas and hide button
    canvas.style.display = "block";
    let btn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("button");
    btn.style.display = "none";


    //There has to be a user interaction first to allow sound, so we start the game only after a button was pressed
    //create two clouds
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

    //create player
    player = new Player();

    //start contiuesly spawning invaders
    randomInterval();

    //call function animate every 25ms
    window.setInterval(function (): void {
        animate();
    }, 35)

    window.setInterval(function (): void {
        currentPoints += 1;
    }, 1000)
}

class Player {
    //declare variables for width, height and position of the player
    width: number;
    height: number;
    position;

    lives: number;

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

    //Get Images for left and right step
    image: HTMLImageElement;

    imageLeft: HTMLImageElement;
    imageRight: HTMLImageElement;
    currentImgIsLeft: boolean = true;
    counter: number = 0;

    width: number;
    height: number;
    position;
    sound: HTMLAudioElement;
    volume: GainNode;
    audioContext: AudioContext;
    source: MediaElementAudioSourceNode;
    distortion: WaveShaperNode;
    currentDist: number = 800;
    filter;
    filterVal: number = 3000;
    // Add a lane property to the Invader class
    lane: LANE;


    constructor(initialLane: LANE) {
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

        this.imageLeft = new Image();
        this.imageRight = new Image();
        this.imageLeft.src = './IMG/Dino_Walk1.png';
        this.imageRight.src = './IMG/Dino_Walk2.png';

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
        this.volume = this.audioContext.createGain()
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
        this.volume.connect(this.filter)
        this.filter.connect(this.audioContext.destination);

        this.filter.type = "lowpass";
        this.filter.frequency.setTargetAtTime(this.filterVal, this.audioContext.currentTime, 0);

    }

    draw() {
        if (this.image && this.lane === currentLane) {
            //draw the dino
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
        // Scale based on vertical position
        const scale = 1 + (this.position.y / canvas.height) * 0.02;

        //apply scale to width and height 
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

        //make sure dino stays in the middle of the screen
        this.position.x = canvas.width / 2 - this.width / 2;

        if (this.position.x < canvas.width / 4 && this.lane === currentLane) {
            handleCollision(); // Function to handle collision
        }


        //if the dino is wider than the canvas, make it despawn
        if (this.width >= canvas.width) {
            invaders.splice(0, 1);
        }
    }

    playSound(): void {
        //function to play the sounds
        this.sound.play();
        this.volume.gain.value += 0.01;
        this.currentDist -= 2;
        this.distortion.curve = this.distortionCurve(this.currentDist);
        this.filterVal += 150;
        this.filter.frequency.setTargetAtTime(this.filterVal, this.audioContext.currentTime, 9);
    }

    distortionCurve(amount: number): Float32Array {
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
    scale: number;
    x: number;
    y: number;
    image: HTMLImageElement;

    constructor(x: number, y: number, type: number) {
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
    // Function to spawn the dinos
    if (invaders.length === 0) {
        // Create a new invader with the selected lane
        const invader = new Invader(currentLane);

        invaders.push(invader);

        /* invaders.push(new Invader(currentLane)); */
        console.log("hello dino");
    }
}



function randomInterval(): void {
    //create random intervals and call the createInvaders function to create more dinos
    let func = function () {
        createInvaders();
        let randomSpawn: number = 5000 + Math.random() * 10000;
        setTimeout(func, randomSpawn);
    }
    func();
}

function animate() {
    //change the background color according to the current lane
    if (currentLane == LANE.MIDDLE) {
        c.fillStyle = '#BCE5E7';
        c.fillRect(0, 0, canvas.width, canvas.height);
        /* c.drawImage(ground, 100, 100, 100, 100) */
    }
    else if (currentLane == LANE.LEFT) {
        c.fillStyle = 'red';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    else if (currentLane == LANE.RIGHT) {
        c.fillStyle = 'blue';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw clouds (because they were drawn over with the background)
    clouds.forEach(cloud => cloud.draw());

    // Draw player
    /*     player.draw(); */

    invaders.forEach((invader) => {
        // Check if the invader is on the same lane as the player before drawing
        invader.draw();

    });

    elapsedTime += 0.025;
    c.font = "20px Arial";
    c.fillStyle = "white";
    c.fillText("Time: " + Math.floor(elapsedTime) + "s", 10, 60);
    drawLives();

    /* // Update all invaders' positions
    invaders.forEach((invader) => {
        invader.draw();
    }); */
}


// Handle keyboard input
// Depending on the pressed key, change the current lane
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

function switchLanes(dir: string): void {
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

function setOverlayText(text: string) {
    startScreenDiv.classList.remove("error");
    startScreenDiv.innerHTML = text;
}

// display error message on start screen
function setOverlayError(text: string) {
    startScreenDiv.classList.add("error");
    startScreenDiv.innerHTML = text;
}


let dataStreamTimeout: NodeJS.Timeout | null = null;
let dataStreamResolve: (() => void) | null = null;
let scaleAcc = 1; // scale factor to re-invert iOS acceleration

// get promise for device motion check and start
function requestDeviceMotion() {
    return new Promise<void>((resolve, reject) => {
        dataStreamResolve = resolve;

        // set timeout in case that the API is ok, but no data is sent
        dataStreamTimeout = setTimeout(() => {
            dataStreamTimeout = null;
            reject("no device motion/orientation data streams");
        }, 1000);

        if (DeviceMotionEvent || DeviceOrientationEvent) {
            if ((DeviceMotionEvent as any).requestPermission || (DeviceOrientationEvent as any).requestPermission) {
                // ask device motion/orientation permission on iOS
                (DeviceMotionEvent as any).requestPermission()
                    .then((response: any) => {
                        if (response == "granted") {
                            // got permission
                            window.addEventListener("devicemotion", onDeviceMotion);
                            resolve();
                            scaleAcc = -1; // re-invert inverted iOS acceleration values
                        } else {
                            reject("no permission for device motion");
                        }
                    })
                    .catch(console.error);
            } else {
                // no permission needed on non-iOS devices
                window.addEventListener("devicemotion", onDeviceMotion);
            }
        } else {
            reject("device motion/orientation not available");
        }
    });
}

const defaultThreshold = 1.5;
let filterCoeff: number | null = null;
let lastFilteredAcc = 0;
let lastDiffAcc: number | null = null;
let leftPeak = 0;
let rightPeak = 0;

function onDeviceMotion(e: DeviceMotionEvent) {
    if (dataStreamTimeout !== null && dataStreamResolve !== null) {
        dataStreamResolve();
        clearTimeout(dataStreamTimeout);
    }

    const acc = scaleAcc * e.acceleration.x;
    const currentFilteredAcc = filterCoeff as number * lastFilteredAcc + (1 - filterCoeff as number) * acc;
    const currentDiffAcc = currentFilteredAcc - lastFilteredAcc;

    // init filterCoeff with sensor interval
    if (filterCoeff === null) {
        filterCoeff = Math.exp(-2.0 * Math.PI * e.interval! / 2);
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
        }
    } else if (currentFilteredAcc >= defaultThreshold && lastDiffAcc >= 0 && currentDiffAcc < 0) {
        // register right kick (positive acc maximum)
        rightPeak = currentFilteredAcc;

        // trigger on right kick but not on left stop
        const threshold = Math.max(defaultThreshold, -0.666 * leftPeak);
        if (currentFilteredAcc >= threshold) {
            switchLanes("b");
        }
    }
}

function handleCollision(): void {

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

function resetGame(): void {
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
