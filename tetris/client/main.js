const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();
localTetris.element.classList.add('local');
localTetris.run();

const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect('ws://localhost:9000');

const keyListener = (event) => {
    [
        [37, 39, 32, 90, 88, 40],
        [74, 76, 68, 65, 83, 75]
    ].forEach((key, index) => {
        const player = localTetris.player;
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
//document.addEventListener('keyup', keyListener);