class TetrisManager
{
    constructor(document)
    {
        this.document = document;

        this.template = this.document.getElementById('player-template');

        this.instances = new Set;
    }

    createPlayer()
    {
        const element = this.document
            .importNode(this.template.content, true)
            .children[0];
        
        const tetris = new Tetris(element);
        this.instances.add(tetris);

        this.document.getElementById('content').appendChild(tetris.element);

        return tetris;
    }

    removePlayer(tetris)
    {
        this.instances.delete(tetris);
        this.document.getElementById('content').removeChild(tetris.element);
    }

    sortPlayers(tetri)
    {
        tetri.forEach(tetris => {
            this.document.getElementById('content').appendChild(tetris.element);
        });
    }
}