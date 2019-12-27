function createPiece(type) {
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

const tetri = [];

const playerElements = document.querySelectorAll('.player');
[...playerElements].forEach(element => {
    const tetris = new Tetris(element);
    tetri.push(tetris);

    setInterval((function interval() {
        tetris.player.dropInterval *= 0.8;
        return interval;
    })(), 30000);
});

//44

document.addEventListener('keydown', event => {
    [
        [37, 39, 32, 90, 88, 40],
    ].forEach((key, index) => {
        const player = tetri[index].player;
        switch(event.keyCode) {
            case key[0] :               //left arrow
                player.move(-1);
                break; 
            case key[1] :               //right arrow
                player.move(1);
                break; 
            case key[2] : 
                player.drop(0);      //drop to the bottom
                break;
            case key[3] : 
                player.rotate(-1);   //rotate left
                break; 
            case key[4] :
                player.rotate(1);    //rotate right
                break;
            case key[5] :               //down arrow
                player.drop(1);
                break;
        }
    });
});