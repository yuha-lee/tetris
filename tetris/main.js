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

function updateScore() {
    document.getElementById('score').innerText = tetris.player.score;
}

const playerElements = document.querySelectorAll('.player');
[...playerElements].forEach(element => {
    const canvas = element.querySelector('canvas');
    const tetris = new Tetris(canvas);
});

// document.addEventListener('keydown', event => {
//     const player = tetris.player;
//     switch(event.keyCode) {
//         case 37 :               //left arrow
//             player.move(-1);
//             break; 
//         case 39 :               //right arrow
//             player.move(1);
//             break; 
//         case 40 :               //down arrow
//             player.drop(1);
//             break; 
//         case 32 : 
//             player.drop(0);      //drop to the bottom
//             break;
//         case 90 : 
//             player.rotate(-1);   //rotate left
//             break; 
//         case 88 :
//             player.rotate(1);    //rotate right
//             break;
//     }
// });

// updateScore();
setInterval((function interval() {
    tetris.player.dropInterval *= 0.8;
    return interval;
})(), 30000);