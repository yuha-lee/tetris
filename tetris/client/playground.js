const tetrisManager = new TetrisManager(document);

const localTetris = tetrisManager.createPlayer();
localTetris.element.classList.add('local');

const connectionManager = new ConnectionManager(tetrisManager);
// connectionManager.connect('ws://59.6.168.69:9000');
connectionManager.connect('ws://localhost:9000');

// start game when button is clicked
const start = document.getElementById('start');
start.onclick = function() {
    connectionManager.send({
        type: 'game-start'
    });
};

// chat
const send = document.querySelector('button');
send.onclick = function() {
    const text = document.getElementById('text');
    connectionManager.send({
        type: 'chat',
        content: text.value
    });
    text.value = '';
}

// key events
const keyListener = (event) => {
    [
        [37, 39, 32, 90, 88, 40],
    ].forEach(key => {
        const player = localTetris.player;
        if (!player.tetris.isRunning) {
            return;
        }

        if (event.type === 'keydown') {
            if (event.keyCode === key[0]) {
                player.move(-1);    // left arrow
            } else if (event.keyCode === key[1]) {
                player.move(1);     // right arrow
            } else if (event.keyCode === key[2]) {
                player.drop(0);     // drop to the bottom
            } else if (event.keyCode === key[3]) {
                player.rotate(-1);  // rotate left
            } else if (event.keyCode === key[4]) {
                player.rotate(1);   // roate right
            } else if (event.keyCode === key[5]) {
                player.drop(1);     //down arrow
            }
        }
    });
};

document.addEventListener('keydown', keyListener);