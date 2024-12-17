// import Vec2 from "./vec2.js";
let log = document.getElementById("log");
let p1log = document.getElementById("paddle1");
let p2log = document.getElementById("paddle2");
let ballpos = document.getElementById("ballpos");
let balldir = document.getElementById("balldir");
let scoreLog = document.getElementById("score");
let gameStatus = document.getElementById("game-status");

const COLORS = ["#222222", "lightblue", "white", "green", "blue", "purple", "pink", "red", "yellow"];
const DEFAULT_CANVAS_WIDTH = 1024;
const DEFAULT_CANVAS_HEIGHT = 640;
const DEFAULT_PADDLE_PADDING = 50;
const DEFAULT_PADDLE_WIDTH = DEFAULT_CANVAS_HEIGHT / 40;
const DEFAULT_PADDLE_HEIGHT = DEFAULT_CANVAS_HEIGHT / 4;
const DEFAULT_PADDLE_UP_KEY = "KeyW";
const DEFAULT_PADDLE_DOWN_KEY = "KeyS";
const DEFAULT_PADDLE_COLOR = COLORS[0];
const DEFAULT_PADDLE_SPEED = 10;
const DEFAULT_BALL_SIZE = DEFAULT_PADDLE_WIDTH * 1.5;


class Score {
	constructor ({
		p1 = 0, 
		p2 = 0, 
		maxScore = 5
	} = {}) {
		this.p1 = p1;
		this.p2 = p2;
		this.maxScore = maxScore;
	}

	reset() {
		this.p1 = 0;
		this.p2 = 0;
	}
}

class Paddle {
	constructor ({
		width = DEFAULT_PADDLE_WIDTH, 
		height = DEFAULT_PADDLE_HEIGHT, 
		x = DEFAULT_PADDLE_PADDING, 
		y = DEFAULT_CANVAS_HEIGHT / 2 - DEFAULT_PADDLE_HEIGHT / 2, 
		up = DEFAULT_PADDLE_UP_KEY, 
		down = DEFAULT_PADDLE_DOWN_KEY, 
		color = COLORS[0],
		speed = DEFAULT_PADDLE_SPEED,
	} = {}) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.up = up;
		this.down = down;
		this.color = color;
		this.speed = speed;
	}

	reset(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Ball {
	constructor ({
		size = DEFAULT_BALL_SIZE,
		x = DEFAULT_CANVAS_WIDTH / 2,
		y = DEFAULT_CANVAS_HEIGHT / 2,
		dx = 1,
		dy = 0,
		speed = DEFAULT_PADDLE_SPEED / 4,
		color = COLORS[0],
	} = {}) {
		this.size = size;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.speed = speed;
		this.color = color;
	}

	reset(side) {
		this.x = DEFAULT_CANVAS_WIDTH / 2;
		this.y = DEFAULT_CANVAS_HEIGHT / 2;
		this.dx = side;
		this.dy = Math.random() * 1 - 0.5;
		this.speed = DEFAULT_PADDLE_SPEED / 4;
		this.color = COLORS[0];
	}

	randomColor() {
		this.color = COLORS[Math.round((Math.random() * COLORS.length))];
	}
}

class Game {
	constructor ({
		canvas = document.getElementById("canvas"), 
		ctx = canvas.getContext("2d"), 
		keyStates = {}, 
		width = DEFAULT_CANVAS_WIDTH, 
		height = DEFAULT_CANVAS_HEIGHT, 
		score = new Score(),
		p1 = new Paddle(),
		p2 = new Paddle({x: width - DEFAULT_PADDLE_WIDTH - DEFAULT_PADDLE_PADDING, 
			up: "ArrowUp", down: "ArrowDown"}),
		ball = new Ball({dx: Math.random() % 2 == 0 ? 1 : -1, dy: Math.random() * 1 - 0.5}),
		running = false,
		paused = false,
	} = {}) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.keyStates = keyStates;
		this.width = width;
		this.height = height;
		this.gameLoop = this.gameLoop.bind(this);
		this.score = score;
		this.p1 = p1;
		this.p2 = p2;
		this.ball = ball;
		this.running = running;
		this.paused = paused;
	}
	
	init() {
		if (!this.ctx || !this.canvas) {
			log.textContent = "failed to load game";
			return;
		}
		window.addEventListener("keydown", (e) => this.onKeyDown(e));
		window.addEventListener("keyup", (e) => this.onKeyUp(e));
		window.addEventListener("blur", () => this.paused = true)
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		requestAnimationFrame(this.gameLoop);
	}

	debug() {
		p1log.textContent = `p1: x ${this.p1.x.toPrecision(3)} y ${this.p1.y.toPrecision(3)}`;
		p2log.textContent = `p2: x ${this.p2.x.toPrecision(3)} y ${this.p2.y.toPrecision(3)}`;
		ballpos.textContent = `ball: x ${this.ball.x.toPrecision(3)} y ${this.ball.y.toPrecision(3)}`;
		balldir.textContent = `dir: x ${this.ball.dx.toPrecision(2)} y ${this.ball.dy.toPrecision(2)}`;
	}
	
	gameLoop() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		if (this.paused) {
			this.drawPaused();
		} else if (this.running) {
			this.updateBall();
			this.updatePaddles();
			gameStatus.textContent = "";
		} else {
			this.drawControls();
		}
		this.drawBall(this.ball);
		this.drawPaddle(this.p1);
		this.drawPaddle(this.p2);
		this.drawScore();
		// this.debug();
		requestAnimationFrame(this.gameLoop);
	}
	
	onKeyDown(e) {
		if (e.code == "Escape") {
			this.paused = !this.paused;
		} else if (!this.paused) {
			this.keyStates[e.code] = true;
			this.running = true;
		}
	}
	
	onKeyUp(e) {
		this.keyStates[e.code] = false;
	}

	drawScore() {
		scoreLog.textContent = `${this.score.p1} : ${this.score.p2}`;
	}
	
	drawPaused() {
		gameStatus.textContent = "Press ESC to unpause...";
	}

	drawControls() {
		gameStatus.textContent = "Press any key to begin...";
	}

	updateBall() {
		// side wall collision
		if (this.ball.y - this.ball.size / 2 + this.ball.dy * this.ball.speed <= 0 
			|| this.ball.y + this.ball.size / 2 + this.ball.dy * this.ball.speed >= this.height) {
			this.ball.dy = -this.ball.dy;
		}
		
		// ball crosses left goal
		if (this.ball.x <= 0) {
			this.score.p2++;

			if (this.score.p2 >= this.score.maxScore) {
				this.score.reset();
			}

			this.p1.reset(DEFAULT_PADDLE_PADDING, canvas.height / 2 - this.p1.height / 2);
			this.p2.reset(canvas.width - DEFAULT_PADDLE_PADDING - this.p2.width, canvas.height / 2 - this.p1.height / 2);
			this.ball.reset(-1);
			this.running = false;
		}
		
		// ball crosses right goal
		if (this.ball.x >= this.width) {
			this.score.p1++;
			
			if (this.score.p1 >= this.score.maxScore) {
				this.score.reset();
			}
			
			this.p1.reset(DEFAULT_PADDLE_PADDING, canvas.height / 2 - this.p1.height / 2);
			this.p2.reset(canvas.width - DEFAULT_PADDLE_PADDING - this.p2.width, canvas.height / 2 - this.p1.height / 2);
			this.ball.reset(1);
			this.running = false;
		}

		// left paddle collision
		if ((this.ball.x - this.ball.size / 2) + this.ball.dx * this.ball.speed <= this.p1.x + this.p1.width &&
		this.ball.x - this.ball.size / 2 > this.p1.x + this.p1.width &&
		this.ball.y + this.ball.size >= this.p1.y &&
		this.ball.y - this.ball.size <= this.p1.y + this.p1.height) {
			this.ball.dx = -this.ball.dx;
			this.ball.dy = (this.ball.y - (this.p1.y + this.p1.height / 2) - 0.5) / this.p1.height;
			this.ball.speed += 1;
			// this.ball.randomColor();
		}
		
		// right paddle collision
		if ((this.ball.x + this.ball.size / 2) + this.ball.dx * this.ball.speed >= this.p2.x &&
		this.ball.x + this.ball.size / 2 < this.p2.x &&
		this.ball.y + this.ball.size >= this.p2.y &&
		this.ball.y - this.ball.size <= this.p2.y + this.p2.height) {
			this.ball.dx = -this.ball.dx; 
			this.ball.dy = (this.ball.y - (this.p2.y + this.p2.height / 2) - 0.5) / this.p2.height;
			this.ball.speed += 1;
			// this.ball.randomColor();
		}
		
		this.ball.x += this.ball.dx * this.ball.speed;
		this.ball.y += this.ball.dy * this.ball.speed;
	}

	updatePaddles() {

		// left paddle movement
		if (this.keyStates[this.p1.up]) {
			this.p1.y -= this.p1.speed;
			if (this.p1.y < 0)
				this.p1.y = 0;
		} else if (this.keyStates[this.p1.down]) {
			this.p1.y += this.p1.speed;
			if (this.p1.y + this.p1.height > this.canvas.height)
				this.p1.y = this.canvas.height - this.p1.height;
		}
		
		// right paddle movement
		if (this.keyStates[this.p2.up]) {
			this.p2.y -= this.p2.speed;
			if (this.p2.y < 0)
				this.p2.y = 0;
		} else if (this.keyStates[this.p2.down]) {
			this.p2.y += this.p2.speed;
			if (this.p2.y + this.p2.height > this.canvas.height)
				this.p2.y = this.canvas.height - this.p2.height;
		}
	}

	drawPaddle(paddle) {
		this.ctx.fillStyle = paddle.color;
		this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	}
	
	drawBall(ball) {
		this.ctx.fillStyle = ball.color;
		this.ctx.beginPath();
		this.ctx.arc(ball.x, ball.y, ball.size / 2, 0, 2 * Math.PI);
		this.ctx.fill();
	}
}

let gameState = new Game();
gameState.init();
