class Player {
    constructor(tetris) {
        this.tetris = tetris;
        this.arena = tetris.arena;
        this.matrix = null;
        this.pos = { x: 5, y: 0 };
        this.isWinner = true;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.events = new Events();
        
        this.reset();
    }

    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
            return;
        }
        this.events.emit('pos', this.pos);
    }

    _rotate(matrix) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        matrix.reverse();
    }
    
    rotate() {
        const pos = this.pos.x;
        let offset = 1;
        this._rotate(this.matrix);
        while(this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotate(this.matrix);
                this.pos.x = pos;
                return;
            }
        }
        this.events.emit('matrix', this.matrix);
    }

    drop(isHardDrop) {
        if (isHardDrop) {
            while (!this.arena.collide(this)) {
                this.pos.y++;
            }       
        } else {
            this.pos.y++;
        }

        this.dropCounter = 0;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);

            if (this.pos.y <= 0) {
                this.isWinner = false;
                this.events.emit('isWinner', this.isWinner);
                return;
            }

            this.reset();
            const rowCount = this.arena.clear();

            if (rowCount > 2) {
                this.attack();
            }
        }
        this.events.emit('pos', this.pos);
    }

    reset() {
        const pieces = 'ILJOTSZ';
        this.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.events.emit('matrix', this.matrix);
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);
        this.events.emit('pos', this.pos);

        if (this.arena.collide(this)) {
            while (this.arena.collide(this)) {
                this.pos.y--;
            }

            if (this.arena.collide(this)) {
                this.pos.y++;
                this.arena.merge(this);
                this.isWinner = false;
                this.events.emit('isWinner', this.isWinner);
            }
            return;
        }

        this.events.emit('matrix', this.matrix);
        this.events.emit('pos', this.pos);
    }

    update(deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

    attack() {
        console.log('attack');
    }

    createPiece(type) {
        switch(type) {
            case 'T':
                return [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0],
                ];
            case 'O':
                return [
                    [2,2],
                    [2,2]
                ];
            case 'L':
                return [
                    [0, 3, 0],
                    [0, 3, 0],
                    [0, 3, 3],
                ];
            case 'J':
                return [
                    [0, 4, 0],
                    [0, 4, 0],
                    [4, 4, 0],
                ];
            case 'I':
                return [
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                ];
            case 'S':
                return [
                    [0, 6, 6],
                    [6, 6, 0],
                    [0, 0, 0],
                ];
            case 'Z':
                return [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0],
                ];
        }
    } 
}