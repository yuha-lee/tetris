class Client {
    constructor(conn, id) {
        this.id = id;
        this.conn = conn;
        this.session = null;
        this.state = null;
    }

    send(data) {
        const msg = JSON.stringify(data);
        console.log(`Sending message: ${msg}`);
        this.conn.send(msg, function ack(err) {
            if (err) {
                console.error('Message failed', msg, err);
            }
        });
    }

    broadcast(data) {
        if (!this.session) {
            throw new Error('Cannot broadcast without session');
        }

        data.clientId = this.id;
        this.session.clients.forEach(client => {
            if (this === client) {
                return;
            }
            client.send(data);
        });
    }
}

module.exports = Client;