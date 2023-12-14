const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor() {
      this.velocity = {
        x: 0,
        y: 0,
      };
  
      this.width = 50; // Set the width of the player
      this.height = 50; // Set the height of the player
  
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
    }
  
    update() {
      this.draw();
      this.position.x += this.velocity.x;
  
      // Ensure player stays within the canvas
      this.position.x = Math.max(0, Math.min(this.position.x, canvas.width - this.width));
      this.position.y = Math.max(0, Math.min(this.position.y, canvas.height - this.height));
    }
  }

  class Invader {
    constructor() {
      this.velocity = {
        x: 0,
        y: 1,
      };
  
      const image = new Image();
      image.src = './IMG/Dino.png';
      image.onload = () => {
        const scale = 0.05;
        this.image = image;
        this.width = image.width * scale;
        this.height = image.height * scale;
        this.spawn();
      };
  
      this.appearDelay = 5000 + Math.random() * 30000; // Random delay between 5 and 35 seconds
      this.timeSinceLastSpawn = 0; // Initialize time tracker
    }
  
    spawn() {
      // Randomly choose one of three starting positions
      const positions = [
        { x: canvas.width / 2 - this.width / 2, 
          y: canvas.height / 4 },
        // Add more positions as needed
      ];
  
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  
      // Set the initial spawn position
      this.position = {
        x: randomPosition.x,
        y: this.height, // Start by /4
      };
    }
  
    draw() {
      if (this.image) {
        const scale = 1 + (this.position.y / canvas.height) * 2; // Scale based on vertical position
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width * scale, 
            this.height * scale
        );
      }
    }
  
    update() {
      if (this.image) {
        this.timeSinceLastSpawn += 16; // Increase time tracker by the frame time (16 milliseconds)
  
        // Wait until the delay is over before updating and drawing the invader
        if (this.timeSinceLastSpawn >= this.appearDelay) {
          this.draw();
          this.position.x += this.velocity.x;
          this.position.y += this.velocity.y;
  
          // Ensure invader stays within the canvas
          if (this.position.x < 0 || this.position.x + this.width > canvas.width) {
            this.velocity.x *= -1; // Reverse direction if hitting the canvas boundaries
          }
          this.position.y = Math.max(0, Math.min(this.position.y, canvas.height - this.height));
  
          // Check if the invader goes below the canvas
          if (this.position.y > canvas.height) {
            this.spawn(); // Respawn the invader at the top
            this.timeSinceLastSpawn = 0; // Reset the time tracker for the next invader
            this.appearDelay = 5000 + Math.random() * 30000; // Random delay between 5 and 35 seconds
          }
        }
      }
    }
}

/*class Tree {

}

// Cloud
function drawCloud(x, y) {
    const image = new Image();
    image.src = './IMG/Cloud_1.png';
  
    image.onload = () => {
      c.drawImage(image, x, y, image.width, image.height);
    };
  }
  
  // Instantiate and draw static elements
  const clouds = [{ x: canvas.width / 2, y: canvas.height / 4 }];*/

  // Cloud
class Cloud1 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.image = new Image();
      this.image.src = './IMG/Cloud_1.png';
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

  
const clouds = [new Cloud1(
    canvas.width / 1.5, 
    canvas.height / 4
)];





const player = new Player();
const invaders = []; // Array to store multiple invaders

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

function createInvaders(numInvaders) {
  for (let i = 0; i < numInvaders; i++) {
    invaders.push(new Invader());
  }
}

function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = '#BCE5E7';
  c.fillRect(0, 0, canvas.width, canvas.height);

  // Draw static elements
  clouds.forEach(cloud => cloud.draw());

  // Update player position
  player.update();

  // Update all invaders' positions
  invaders.forEach((invader) => {
    invader.update();
  });

  // Move the player left and right using keyboard input
  if (keys.a.pressed) {
    player.velocity.x = -5;
  } else if (keys.d.pressed) {
    player.velocity.x = 5;
  } else {
    player.velocity.x = 0;
  }
}

createInvaders(5); // You can specify the number of invaders

// Wait for images to load before starting the animation
Promise.all(clouds.map(cloud => new Promise(resolve => cloud.image.onload = resolve)))
  .then(() => {
    animate();
  })
  .catch(error => {
    console.error('Error loading images:', error);
  });

animate();

// Handle keyboard input
addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'a':
      keys.a.pressed = true;
      break;
    case 'd':
      keys.d.pressed = true;
      break;
  }
});

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'a':
      keys.a.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
  }
});
