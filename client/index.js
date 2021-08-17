const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer(true);
const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect('wss://yuha-tetris.herokuapp.com');

const keydownHandler = (event) => {
    if (localTetris.isOver) {
        return;
    }
    const player = localTetris.player;
    if (event.key === 'ArrowRight') {
        player.move(1);
    } else if (event.key === 'ArrowLeft') {
        player.move(-1);
    } else if (event.key === 'ArrowDown') {
        player.drop();
    } else if (event.key === 'ArrowUp') {
        player.rotate();
    } else if (event.code === 'Space') {
        player.drop(true);
    }
};

const clickHandler = (event) => {
    if (event.target.className.indexOf('chat-send-btn') > -1) {
        const textInput = document.querySelector('.chat-send-btn').previousElementSibling;
        if (textInput.value.trim() === '') {
            return;
        }
        localTetris.player.events.emit('chat', textInput.value);
        textInput.value = '';
    } else if (event.target.className.indexOf('invite') > -1) {
        const tmpInput = document.createElement('INPUT');
        document.body.appendChild(tmpInput);
        tmpInput.value = window.location.href;
        tmpInput.select();
        document.execCommand('copy');
        document.body.removeChild(tmpInput);
        alert('Copied link to your clipboard.\nSend it to your friend!')
    } else if (event.target.className.indexOf('start') > -1) {
        localTetris.player.events.emit('start', true);
        event.target.parentElement.className += ' hide';
    }
}

document.addEventListener('keydown', keydownHandler);
document.addEventListener('click', clickHandler);