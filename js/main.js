function Game(id) {
	this.id = id;
	this.canvas = null;
	this.context = null;
	this.snakeArray = [];
	this.startLength = 3;
	this.canvasWidth = null;
	this.canvasHeight = null;
	this.keymap = {};
	this.hitWallMessage = "<span>Loser!!!</span>Stop hitting the wall";
	this.hitSelfMessage = "<span>Loser!!!</span>Stop eating yourself";
	this.popUpWrap = null;
	this.appleCount = null;
	this.appleCountWrap = document.getElementById('apple-count');
	this.fieldSize = {
		w : 35,
		h : 30
	};
	this.cellWidth = {
		w : null,
		h : null
	};
}

Game.prototype = {
	init: function () {
		var self = this;

		this.canvas = document.getElementById(this.id);
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;
		this.popUpWrap = document.getElementById('pop-up');

		if (!this.canvas) {
			return false
		}

		window.addEventListener('keydown', function(e) {
			self.keyDownEvent(e);
		}, false);

		window.addEventListener('keyup', function(e) {
			self.keyUpEvent(e);
		}, false);

		this.context = this.canvas.getContext('2d');

		this.cellWidth = {
			w : this.canvasWidth / this.fieldSize.w,
			h : this.canvasHeight / this.fieldSize.h
		};

		this.startGame();
	},

	startGame : function () {
		var self = this;

		this.snakeArray = [];
		this.apple = {};
		this.headX = null;
		this.headY = null;
		this.direction = 'right';

		this.createSnake();
		this.createApple();
		this.appleCount = 0;
		this.writeAppleCount();
		this.speed = 100;
		this.stopped = false;
		this.requestId = 0;

		function startTick(){
			this.timeBefore = Date.now();
			tick();
		}

		function tick() {

			// todo try both cancelAnimationFrame and if
				self.requestId = requestAnimationFrame(tick);


			this.now = Date.now();
			this.elapsed = this.now - this.timeBefore;

			if (this.elapsed > self.speed) {

				this.timeBefore = this.now - (this.elapsed % self.speed);

				self.checkKeys();
				self.actions();
				self.drawObjects();
			}
		}
		startTick();

	},

	keyUpEvent: function (e) {
		var key = (e).which;
		this.keymap[key] = false;
	},

	keyDownEvent: function (e) {
		var key = (e).which;
		this.keymap[key] = true;
	},

	createSnake: function () {
		for (var i = this.startLength; i > 0; i--) {
			this.snakeArray.push({x: i, y: 2});
		}
	},

	createApple: function () {
		this.apple = {
			x: Math.floor(Math.random()*(this.fieldSize.w)),
			y: Math.floor(Math.random()*(this.fieldSize.h))
			// todo wtf?
		};
	},

	actions : function () {
		var wallCollision = this.checkWallCollision(this.headX, this.headY);
		var selfCollision = this.checkSelfCollision(this.headX, this.headY, this.snakeArray);

		if ( selfCollision || wallCollision) {
			this.endGame(selfCollision, wallCollision);
			// todo endGame function
		} else if (this.checkAppleCollision()) {
			this.eatApple();
		}
		this.move();
		// todo move()
	},

	eatApple : function () {
		// todo use this
		this.growUp();
		this.speedUp();
		this.appleCount += 1;
		this.writeAppleCount();
		this.createApple();
	},

	growUp: function() {
		var lastIndex = this.snakeArray.length - 1,
			tailElement = this.snakeArray[lastIndex];

		this.snakeArray.push({
			x: tailElement.x,
			y: tailElement.y
		});
	},

	speedUp : function () {
		this.speed -= this.speed*0.05;
	},

	checkKeys : function () {
		var directions = {
			37 : 'left',
			38 : 'up',
			39 : 'right',
			40 : 'down'
		};

		var opposites = {
			left : 'right',
			up : 'down',
			right : 'left',
			down : 'up'
		};

		for (var key in this.keymap) {
			if (this.keymap[key] && (key in directions) && (this.direction !== opposites[directions[key]])) {
				this.direction = directions[key];
			}
		}
	},

	move : function () {
		this.headX = this.snakeArray[0].x;
		this.headY = this.snakeArray[0].y;

		// each direction - change x, change y
		var moveMap = {
			'right' : [1, 0],
			'down' : [0, 1],
			'left' : [-1, 0],
			'up' : [0, -1]
		};

		var currentMove = moveMap[this.direction];
		this.headX += currentMove[0];
		this.headY += currentMove[1];

		var tail = this.snakeArray.pop();
		tail.x = this.headX; tail.y = this.headY;

		this.snakeArray.unshift(tail);
	},

	drawObjects: function () {
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

		for (var i = 0; i < this.snakeArray.length; i++) {
			var eachSnakeCell = this.snakeArray[i];
			this.drawCell(eachSnakeCell.x, eachSnakeCell.y, '#1460ad');
		}

		this.drawCell(this.apple.x,this.apple.y, 'red');
	},

	drawCell: function (x, y, style) {
		var cellX = this.cellWidth.w,
			cellY = this.cellWidth.h,
			graphX = x*cellX,
			graphY = y*cellY;

		this.context.fillStyle = style;
		this.context.fillRect(graphX, graphY, cellX, cellX);
		this.context.strokeStyle = 'white';
		this.context.strokeRect(graphX, graphY, cellX, cellX);

	},

	checkWallCollision : function (x, y) {
		var leftWall = x < 0,
			rightWall = x > this.fieldSize.w - 1,
			topWall = y < 0,
			bottomWall = y > this.fieldSize.h - 1;

		return (leftWall || rightWall || topWall || bottomWall);
	},

	checkSelfCollision : function (x, y, array) {
		var selfCollided = false,
			j = 1;

		while (!selfCollided && j < array.length) {
			selfCollided = (array[j].x == x && array[j].y == y);
			j++;
		}
		return selfCollided;
	},

	checkAppleCollision : function () {
		// todo simplify
		return (this.headX == this.apple.x && this.headY == this.apple.y);
	},

	writeLoseMessage : function (message) {
		var messageWrap = document.getElementById('message');

		messageWrap.innerHTML = message;
		this.popUpWrap.style.display = "block";
	},

	writeAppleCount : function () {
		// todo cache this
		this.appleCountWrap.innerHTML = "Apples: " + this.appleCount;
	},

	endGame : function (selfCollided, wallCollided) {

		cancelAnimationFrame(this.requestId);


		if (selfCollided) {
			this.writeLoseMessage(this.hitSelfMessage);
		} else {
			this.writeLoseMessage(this.hitWallMessage);
		}

	},

	closePopUp : function () {
		this.popUpWrap.style.display = "none";
	}
};


function pageLoad() {
	var game = new Game('screen'),
		btn =  document.getElementById('restart-btn');

	game.init();

	btn.addEventListener('click', function() {
		game.closePopUp();
		game.startGame();
	});
}

window.addEventListener('load', pageLoad);

