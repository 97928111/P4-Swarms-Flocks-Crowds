const blue = "#078FC5";
const pinkcolor = "#FF5D8F";
const redd = "#B20608";
const purplee = "#7909C3";
const black = "#0A0A0A";
const white = "#FFFFFF";
const brown = "#7A4100";
const gray = "#858585";
const darkred = "#4F0204";
const lightred = "#F91018";
const green = "#35D485"
const lightgreen = "#89E6B8"
const yellow = "#FBFF85"
const pink = "#FFA6C1"
let flock;

function setup() {
  createCanvas(640, 400);
  createP("Drag the mouse to generate new fish.");

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

function draw() {
  background(blue);
  fill(green);

  noStroke();
  beginShape();
  rect(60, 200, 20, 300 , 20);
  rect(120, 300, 20, 300 , 20);
  rect(220, 250, 20, 300 , 20);
  rect(320, 100, 25, 400 , 20);
  rect(440, 170, 20, 400 , 20);
  rect(540, 210, 20, 400 , 20);
  endShape();
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 2), random(-1, 2));
  this.velocity2 = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 4;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  //this.borders();
  this.render();
  this.renderr();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let avo = this.avoid(boids);      // Avoid walls
  // Arbitrarily weight these forces
  sep.mult(10.0);
  ali.mult(2.0);
  coh.mult(1.0);
  avo.mult(3.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a fish rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  noStroke()
  beginShape();
  fill(lightgreen);
  vertex(0, 30);
  vertex(12, 0);
  vertex(0, -12);
  vertex(-12, 0);
  endShape(CLOSE);
  fill(lightred);
  circle(0,0,7)
  fill(white)
  circle(-1,0,2)
  fill(yellow)
  triangle(0, 25, -10, 40, 10, 40);
  pop();
}

Boid.prototype.renderr = function() {
  // Draw a pink fish rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  fill(pink);
  stroke(200);
  push();
  translate(this.position.x+100, this.position.y+100);
  rotate(theta);
  beginShape();
  vertex(0, -30);
  vertex(-20, 0);
  vertex(-10, 5);
  vertex(0, 30);
  vertex(10, 5);
  vertex(20, 0);
  endShape(CLOSE);
  fill(white);
  circle(0,-15,8)
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  if (this.position.x <= 0) {
    steer.add(createVector(1, 0));
  }
  if (this.position.x > 640) { // width of canvas
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 0) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > 360) { // height of canvas
    steer.add(createVector(0, -1));
  }
  return steer;
}
