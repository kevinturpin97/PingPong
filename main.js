class PingPong {
    #root = document.getElementById("game");
    #canvas = document.createElement("canvas");
    #ctx = this.#canvas.getContext("2d");
    #windows = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    #ball = {};
    #players = {};
    #winOrLose = false;

    constructor() {
        if (!this.#root) {
            throw new Error("Game element not found");
        }

        this.#canvas.width = this.#windows.width;
        this.#canvas.height = this.#windows.height;

        this.#root.appendChild(this.#canvas);

        this.#players = {
            player: {
                x: 10,
                y: (this.#windows.height / 2) - 60 - Math.random() * 100,
                width: 10,
                height: 120,
                score: 0
            },
            computer: {
                x: this.#windows.width - 20,
                y: (this.#windows.height / 2) - 60 - Math.random() * 100,
                width: 10,
                height: 120,
                score: 0
            }
        };

        this.#resetBall();
    }

    init() {
        let isMovingUp = false;
        let isMovingDown = false;

        const handleKeyDown = (e) => {
            if (e.key === "z") {
                isMovingUp = true;
            } else if (e.key === "s") {
                isMovingDown = true;
            } else if (e.key === " " && this.#winOrLose) {
                document.location.reload();
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === "z") {
                isMovingUp = false;
            } else if (e.key === "s") {
                isMovingDown = false;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        const movePlayer = () => {
            if (isMovingUp && this.#players.player.y - 1 >= 0) {
                this.#players.player.y -= 10;
            }

            if (isMovingDown && this.#players.player.y + 1 <= this.#windows.height - this.#players.player.height) {
                this.#players.player.y += 10;
            }

            requestAnimationFrame(movePlayer);
        };

        movePlayer();
    }

    render() {
        this.#renderBoard();
        this.#renderPlayer(false);
        this.#renderPlayer(true);
        this.#renderBall();
        this.#renderScore();
    }

    #renderBoard() {
        this.#ctx.clearRect(0, 0, this.#windows.width, this.#windows.height);

        this.#ctx.fillStyle = "#000";
        this.#ctx.fillRect(0, 0, this.#windows.width, this.#windows.height);

        this.#ctx.fillStyle = "#fff";
        this.#ctx.fillRect((this.#windows.width / 2) - 3, 0, 6, this.#windows.height);
    }

    #renderPlayer(computer) {
        const player = computer ? this.#players.computer : this.#players.player;

        this.#ctx.fillStyle = "#fff";
        this.#ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    #renderBall() {
        const x = this.#ball.x;
        const y = this.#ball.y;

        this.#ctx.beginPath();
        this.#ctx.fillStyle = "#fff";
        this.#ctx.arc(x, y, this.#ball.radius, 0, Math.PI * 2);
        this.#ctx.fill();
    }

    #renderScore() {
        this.#ctx.fillStyle = "#fff";
        this.#ctx.font = "20px Arial";

        for (let i = 0; i < 5 - this.#players.player.score; i++) {
            this.#ctx.fillText("❤️", this.#windows.width - 30 - i * 20, 20);
        }
        
        for (let i = 0; i < 5 - this.#players.computer.score; i++) {
            this.#ctx.fillText("❤️", 10 + i * 20, 20);
        }
    }

    update() {
        const frame = setInterval(() => {
            this.#updateBall();
            this.#computerAI();
            this.render();

            if (this.#winOrLose) {
                clearInterval(frame);

                if (this.#players.player.score >= 10) {
                    this.#win();
                } else {
                    this.#lose();
                }
            }
        }, 1000 / 60);
    }

    #updateBall() {
        if (this.#ball.y + this.#ball.radius >= this.#windows.height || this.#ball.y - this.#ball.radius <= 0) {
            this.#ball.direction.y *= -1;

            this.#ball.direction.x += Math.random() * 0.2 - 0.1;
            this.#ball.direction.y += Math.random() * 0.2 - 0.1;
        }

        if (this.#ball.x + this.#ball.radius >= this.#players.computer.x &&
            this.#ball.y >= this.#players.computer.y &&
            this.#ball.y <= this.#players.computer.y + this.#players.computer.height) {

            const relativeIntersectY = (this.#players.computer.y + this.#players.computer.height / 2) - this.#ball.y;
            const bounceAngle = (relativeIntersectY / (this.#players.computer.height / 2)) * Math.PI / 3;

            this.#ball.direction = {
                x: Math.cos(bounceAngle),
                y: Math.sin(bounceAngle)
            };

            this.#ball.speed += 0.5;
        }

        if (this.#ball.x - this.#ball.radius <= this.#players.player.x + this.#players.player.width &&
            this.#ball.y >= this.#players.player.y &&
            this.#ball.y <= this.#players.player.y + this.#players.player.height) {

            const relativeIntersectY = (this.#players.player.y + this.#players.player.height / 2) - this.#ball.y;
            const bounceAngle = (relativeIntersectY / (this.#players.player.height / 2)) * Math.PI / 3;

            this.#ball.direction = {
                x: -Math.cos(bounceAngle),
                y: Math.sin(bounceAngle)
            };

            this.#ball.speed += 0.5;
        }

        if (this.#ball.x + this.#ball.radius >= this.#windows.width) {
            this.#players.player.score++;
            this.#resetBall();
        }

        if (this.#ball.x - this.#ball.radius <= 0) {
            this.#players.computer.score++;
            this.#resetBall();
        }

        this.#ball.x -= this.#ball.speed * this.#ball.direction.x;
        this.#ball.y -= this.#ball.speed * this.#ball.direction.y;

        if (this.#players.player.score >= 5 || this.#players.computer.score >= 5) {
            this.#winOrLose = true;
        }
    }

    #computerAI() {
        if (this.#ball.direction.x > 0) {
            return;
        }

        const computerCenterY = this.#players.computer.y + this.#players.computer.height / 2;
        const deltaY = this.#ball.y - computerCenterY;
        const distance = Math.abs(deltaY);
        let speed = distance < 50 ? 10 : 5;
        const targetY = this.#players.computer.y + speed * Math.sign(deltaY);

        this.#players.computer.y += (targetY - this.#players.computer.y);
    }

    #resetBall() {
        this.#ball = {
            x: this.#windows.width / 2,
            y: this.#windows.height / 2,
            radius: 10,
            speed: 10,
            direction: {
                x: 1,
                y: 0
            }
        };

        console.table({
            player: this.#players.player.score,
            computer: this.#players.computer.score
        });
    }

    #win() {
        this.#ctx.fillStyle = "#fff";
        this.#ctx.font = "100px Arial";
        this.#ctx.fillText("Gagné !", this.#windows.width / 2 - 200, this.#windows.height / 2);
    }

    #lose() {
        this.#ctx.fillStyle = "#fff";
        this.#ctx.font = "100px Arial";
        this.#ctx.fillText("Perdu !", this.#windows.width / 2 - 200, this.#windows.height / 2);
    }

    start() {
        this.init();
        this.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PingPong();

    game.start();
});
