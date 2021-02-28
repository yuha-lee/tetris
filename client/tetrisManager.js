class TetrisManager {
    constructor(document) {
        this.document = document;
        this.instances = new Set;
    }

    createPlayer(isMe) {
        const element = this.document.querySelector(isMe ? '.me' : '.you');
        const tetris = new Tetris(element);
        this.instances.add(tetris);
        return tetris;
    }

    removePlayer(tetris) {
        tetris.isOver = true;
        tetris.clearMatrix();
        this.instances.delete(tetris);
    }
}