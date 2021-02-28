class Tetris {
    constructor(element) {
        this.element = element;
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(30, 30);
        this.arena = new Arena(12, 20);
        this.player = new Player(this);
        this.isOver = true;
        this.colors = [
            null,
            '#ff577f',
            '#ff884b',
            '#ffc764',
            '#cdfffc',
            '#6930c3',
            '#64dfdf',
            '#e40017',
            '#80ffdb'
        ];
        
        let lastTime = 0;
        this._update = (time = 0) => {
            if (this.isOver) {
                return;
            }
            const deltaTime = time - lastTime;
            lastTime = time;
            this.player.update(deltaTime);
            this.draw();

            requestAnimationFrame(this._update);
        };
    }
    
    draw() {
        this.context.fillStyle = '#303137';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.lineWidth = 0.02;
                    this.context.strokeStyle = '#303137';    
                    this.context.beginPath();
                    this.context.rect(x + offset.x, y + offset.y, 1, 1);
                    this.context.stroke();
                    this.context.fill();
                }
            });
        });
    }
    
    clearMatrix() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
    }

    drawGameover() {
        const result = `YOU ${this.player.isWinner ? 'WON' : 'LOST'}`;
        this.context.font = '1px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.strokeStyle = 'antiquewhite';
        this.context.lineWidth = 0.4;
        this.context.strokeText(result,
                            (this.canvas.width / 30) / 2,
                            (this.canvas.height / 30) / 2);                            
        this.context.fillStyle = 'cornflowerblue';
        this.context.fillText(result,
                            (this.canvas.width / 30) / 2,
                            (this.canvas.height / 30) / 2);
    }

    run() {
        this._update();
    }

    serialize() {
        return {
            arena: {
                matrix: this.arena.matrix
            },
            player: {
                pos: this.player.pos,
                matrix: this.player.matrix,
                isWinner: this.player.isWinner
            }
        };
    }

    unserialize(state) {
        this.arena = Object.assign(state.arena);
        this.player = Object.assign(state.player);
    }
}