// PROCESSING START
// ----------------------------
// PlayerCircle Parent class (or subclass) - Player class
// ----------------------------

class PlayerOpponent {
  constructor(id = "", x, y, color = '#ffc689', radius = 30) {
    this.id = id;
    this.x = Math.floor((Math.random() * 1000) + 1);;
    this.y = Math.floor((Math.random() * 1000) + 1);;
    this.radius = radius;
    this.color = color;
    this.speed = 3;
    this.angle = 55;
    this.vx = Math.cos(this.angle*Math.PI/180) * this.speed;
    this.vy = Math.sin(this.angle*Math.PI/180) * this.speed;
    this.ax = 0;
    this.ay = 0;
    this.collision = false;
  }

  setId(id) {
    this.id = id;
    return this;
  }

  draw() {
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    fill(this.color);
    ellipse(this.x, this.y, this.radius);
    this.canvasCollision();
    return this;
  }

  canvasCollision() {
    if (this.x <= 0 || this.x >= 1000 ){
        this.vx = -this.vx;
    }
    if (this.y <= 0 || this.y >= 1000){
      this.vy = -this.vy;
    }
    return this;
  }
} // end of PlayerCircle

class PlayerCircle extends PlayerOpponent {
  constructor(id = "", x, y, color = '#ffcccc', radius = 30) {
    super(id, x, y, color, radius);
    this.speed = 3;
    this.angle = 55;
    this.vx = Math.cos(this.angle*Math.PI/180) * this.speed;
    this.vy = Math.sin(this.angle*Math.PI/180) * this.speed;
    this.ax = 0;
    this.ay = 0;
    this.collision = false;
  }

  checkCollision(objectB) {
      let dx = this.x - objectB.x;
			let dy = this.y - objectB.y;
			let distance = this.radius;
			if (dx * dx + dy * dy <= distance * distance){
				this.collision = true;
        this.radius += 1;
        this.vx = -this.vx;
        this.collision = true;
				console.log("collision");
			}
			return this;
  }

  turn(direction) {
    switch (direction) {
      case 39: // right
        this.vx = -this.vx;
        break;
      case 37: // left
        this.vx = -this.vx;
        break;
      case 40: //down
        this.vy = -this.vy;
        break;
      case 38: // up
        this.vy = -this.vy;
        break;
      }
    }
}

class Grid {
  constructor(rows, cols){
    this.grid = []; // A multidimentional array containing the visual grid
    this.cell = {};
    this.rowsCount = rows; // The height of the map, in rows
    this.colsCount = cols; // The width of the map, in columns
    this.tileSize = 64; // The tile size, in pixels
  }

  render() {
      // creating multidimentional array of grid cells
      for (let column = 0; column < this.colsCount; column++) {
        this.grid[column] = []; // create the next row (inner array)
        for (let row = 0; row < this.rowsCount; row++) {
          fill(255);
          stroke(0);
          this.cell = {
            column: column,
            row: row,
            square: rect(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize)
          }
          this.grid[column][row] = this.cell;
        }
      }
  }
}

/*
.emit Sends messages between server-client(s).
.on Handles incoming messages
*/
const socket = io.connect();
let opponnents = [];
let player;
let some_id;
//PROCESSING at start
function setup() {
  //let nickname = prompt("Nickname: ");
	createCanvas(1000, 1000);
  player = new PlayerCircle();

  grid = new Grid(20, 20);
  grid.render();
}
//PROCESSING every .. seconds
function draw() {
	//clear background
  grid.render();

  player.draw();
  socket.emit('updateOpponents', player);
  for (let i = 0; i < opponnents.length; i++){
    if(opponnents[i].id !== player.id){
      player.checkCollision(opponnents[i]);
      if (player.collision === true) {
        //socket emit player
        //return who is bigger
        //delete that player in backend
      }
      opponnents[i].draw();
    }
  }
}
function keyPressed() {
  player.turn(keyCode);
}

// socket.io
socket.on('connect', function (data) {
    console.log(socket.id);
    player.setId(socket.id);
    socket.emit('newPlayer',  player );
});
// creating all opponents
socket.on('playersList', function (data) {
  opponnents.length = 0;
  for (let i = 0; i < data.length; i++){
    let new_player = new PlayerOpponent(id = data[i].id, x = data[i].x, y = data[i].y);
    opponnents.push(new_player);
  }

//  let check = opponnents.findIndex(x => x.id === player.id);
//  opponnents.splice(check, 1);
});

socket.on('updatedPlayersList', function (data) {
  opponnents.length = 0;
  for (let i = 0; i < data.length; i++){
    let new_player = new PlayerOpponent(id = data[i].id, x = data[i].x, y = data[i].y);
    opponnents.push(new_player);
  }
  console.log("2 "+ opponnents );
  for (let i = 0; i < all_players.length; i++){
    if (all_players[i].id === player.id){
      opponnents.splice(i, 1);
    }
  }
//  let check = opponnents.findIndex(x => x.id === player.id);
//  opponnents.splice(check, 1);
});

socket.on('updatedPlayersPosition', function (data) {
    for (let i = 0; i < opponnents.length; i++){
        opponnents[i].x = data[i].x;
        opponnents[i].y = data[i].y;
        opponnents[i].vx = data[i].vx;
        opponnents[i].vy = data[i].vy;
        opponnents[i].ax = data[i].ax;
        opponnents[i].ay = data[i].ay;
    }
});


const button = document.getElementById('myButton');
button.addEventListener('click', function(e) {
  console.log('button was clicked');

  fetch('/clicked', {method: 'POST'})
    .then(function(response) {
      if(response.ok) {
        console.log('click was recorded');
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
});

setInterval(function() {
  fetch('/clicks', {method: 'GET'})
    .then(function(response) {
      if(response.ok) return response.json();
      throw new Error('Request failed.');
    })
    .then(function(data) {
      document.getElementById('counter').innerHTML = `Button was clicked ${data.length} times`;
    })
    .catch(function(error) {
      console.log(error);
    });
}, 1000);
