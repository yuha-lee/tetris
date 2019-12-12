const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.clientWidth, canvas.height);

    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'red';
                context.fillRect(x + offset.x, 
                                 y + offset.y, 
                                 1, 1);
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    dropCounter = 0;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 5, y: 5},
    matrix: matrix,
}

document.addEventListener('keydown', event => {
    switch(event.keyCode) {
        case 37 :               //left arrow
            player.pos.x--; 
            break; 
        case 39 :               //right arrow
            player.pos.x++; 
            break; 
        case 40 :               //down arrow
            playerDrop();
            break; 
        //case 32 : player.pos.y; break; //spacebar
        //case 90 : z 왼쪽돌리기; break; //z - rotate matrix left
        //case 88 : x 오른돌리기; break; //x - rotate matrix right
    }
});

update();