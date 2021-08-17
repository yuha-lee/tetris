const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const server = express()
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const ws = new Server({ server });

const Session = require('./server/session');
const Client = require('./server/client');
const sessions = new Map;

function createClient(conn, id = createId()) {
    return new Client(conn, id);
}

function createId(len = 6, chars = 'abcdefghjkmnopqrstwxyz0123456789') {
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createSession(id = createId()) {
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }
    const session = new Session(id);
    console.log('Creating session', session);
    sessions.set(id, session);
    return session;
}

function getSession(id) {
    return sessions.get(id);
}

function broadcastSession(session, type) {
    const clients = [...session.clients];
    clients.forEach(client => {
        client.send({
            type: type,
            peers: {
                you: client.id,
                clients: clients.map(client => {
                    return {
                        id: client.id,
                        state: client.state
                    };
                })
            }
        });
    });
}

function broadcastChat(client, content) {
    const clients = [...client.session.clients];
    clients.forEach(c => {
        c.send({
            type: 'chat',
            id: client.id,
            content: content
        });
    });
};

function broadcastStart(client) {
    const clients = [...client.session.clients];
    clients.forEach(client => {
        client.send({ type: 'start' });
    });
};

ws.on('connection', conn => {
    console.log('====== Connection Established ======');
    const client = createClient(conn);

    conn.on('message', msg => {
        console.log(`Message received: ${msg}`);
        const data = JSON.parse(msg);

        if (data.type === 'create-session') {
            const session = createSession();
            session.join(client);
            client.state = data.state;
            client.send({
                type: 'session-created',
                id: session.id
            });
        } else if (data.type === 'join-session') {
            const session = getSession(data.id) || createSession(data.id);
            if (session.clients.size >= 2 || session.isRunning) {
                const newSession = createSession();
                newSession.join(client);
                client.state = data.state;
                client.send({
                    type: 'join-failed',
                    id: newSession.id
                });
                return;
            }
            session.join(client);
            client.state = data.state;
            broadcastSession(session, 'session-broadcast');
        } else if (data.type === 'state-update') {
            const [prop, value] = data.state;
            client.state[data.fragment][prop] = value;
            client.broadcast(data);
        } else if (data.type === 'game-over') {
            const [prop, value] = data.state;
            client.state[data.fragment][prop] = value;
            broadcastSession(client.session, data.type);
        } else if (data.type === 'chat') {
            const [prop, value] = data.state;
            broadcastChat(client, value);
        } else if (data.type === 'start') {
            client.session.run();
            broadcastStart(client);            
        }
    });

    conn.on('close', () => {
        console.log('====== Connection Closed ======');
        const session = client.session;
        if (session) {
            session.leave(client);
            broadcastSession(session);

            if (session.clients.size === 0) {
                sessions.delete(session.id);
            }
        }
    });
})