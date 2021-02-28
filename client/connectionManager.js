class ConnectionManager {
    constructor(tetrisManager) {
        this.conn = null;
        this.peers = new Map;
        this.tetrisManager = tetrisManager;
        this.localTetris = [...tetrisManager.instances][0];
    }

    connect(address) {
        this.conn = new WebSocket(address);
        this.conn.addEventListener('open', () => {
            console.log('Connecion established');
            this.initSession();
            this.watchEvents();
        });

        this.conn.addEventListener('message', event => {
            console.log(`Received message: ${event.data}`);
            this.receive(event.data);
        });
    }

    initSession() {
        const sessionId = window.location.hash.split('#')[1];
        const state = this.localTetris.serialize();
        if (sessionId) {
            this.send({
                type: 'join-session',
                id: sessionId,
                state
            });
        } else {
            this.send({
                type: 'create-session',
                state
            });
        }
    }

    send(data) {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg);
    }

    receive(msg) {
        const data = JSON.parse(msg);
        if (data.type === 'join-failed') {
            alert('Cannot join the game.');
            window.location.hash = data.id;
        } else if (data.type === 'session-created') {
            window.location.hash = data.id;
        } else if (data.type === 'session-broadcast') {
            this.updateManager(data.peers);
        } else if (data.type === 'state-update') {
            this.updatePeer(data.clientId, data.fragment, data.state)
        } else if (data.type === 'game-over') {
            this.endGame(data.peers.clients);
        } else if (data.type === 'chat') {
            this.chat(data.id, data.content);
        } else if (data.type === 'start') {
            this.startGame();
        }
    }

    startGame() {
        this.localTetris.isOver = false;
        const btns = this.localTetris.element.querySelector('.item-btns');
        btns.className += ' hide';
        this.localTetris.run();
    }

    chat(id, content) {
        const chatContent = this.tetrisManager.document.querySelector('.chat-content');
        chatContent.innerHTML += `<div class="chat-content-item">${id} > ${content}</div>`;
    }

    endGame(clients) {
        clients.forEach(client => {
            const tetris = this.peers.get(client.id) || this.localTetris;
            tetris.isOver = true;
            tetris.player.isWinner = client.state.player.isWinner;
            setTimeout(() => {
                tetris.drawGameover(tetris.player.isWinner);
            }, 500);
        });
    }

    updateManager(peers) {
        const me = peers.you;
        const clients = peers.clients.filter(client => me !== client.id);

        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                tetris.unserialize(client.state);
                this.peers.set(client.id, tetris);
            }
        });

        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });
    }

    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) {
            return;
        }

        const tetris = this.peers.get(id);
        tetris[fragment][prop] = value;
        tetris.draw();
    }

    watchEvents() {
        const local = this.localTetris;
        const player = local.player;

        ['pos', 'matrix', 'isWinner', 'chat', 'start'].forEach(prop => {
            let type = prop;
            if (prop === 'pos' || prop === 'matrix') {
                type = 'state-update';
            } else if (prop === 'isWinner') {
                type = 'game-over';
            }

            player.events.listen(prop, value => {
                this.send({
                    type: type,
                    fragment: 'player',
                    state: [prop, value]
                });
            });
        });

        const arena = local.arena;
        ['matrix'].forEach(prop => {
            arena.events.listen(prop, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [prop, value]
                });
            });
        });
    }
}