class Session {
    constructor(id) {
        this.id = id;
        this.clients = new Set;
        this.isRunning = false;
    }

    join(client) {
        if (client.session) {
            throw new Error('Client already in session');
        }
        if (this.isRunning) {
            throw new Error('The game has already started');
        }
        this.clients.add(client);
        client.session = this;
    }

    leave(client) {
        if (client.session !== this) {
            throw new Error('Client not in session');
        }
        this.clients.delete(client);
        client.session = null;
    }

    run() {
        this.isRunning = true;
    }
}

module.exports = Session;