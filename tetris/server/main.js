const http = require('http');
const WebSocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');
const fs = require('fs');

const server = http.createServer(function(req, res) {
    let path = req.url;
    if (path.startsWith('/')) {
        path = path.substr(1, path.length);
    }
    fs.readFile(path, (error, data) => {
        if (error) {
            return console.error(error);
        }
        if (req.url.endsWith('.html')) {
            res.writeHead(200, {'Content-Type' : 'text/html'});
        } else if (req.url.endsWith('.js')) {
            res.writeHead(200, {'Content-Type' : 'application/javascript; charset=utf-8'});
        }
        res.end(data, 'utf-8');
    });
}).listen(9000, '127.0.0.1');

const ws = new WebSocketServer({ server });

const sessions = new Map;

function createId(len = 6, chars = 'abcdefghjkmnopqrstwxyz0123456789')
{
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createClient(conn, id = createId())
{
    return new Client(conn, id);
}

function createSession(id = createId()) 
{
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }
    const session = new Session(id);
    console.log('Creating session', session);

    sessions.set(id, session);

    return session;
}

function getSession(id) 
{
    return sessions.get(id);
}

function broadcastSession(session)
{
    const clients = [...session.clients];
    clients.forEach(client => {
        client.send({
            type: 'session-broadcast',
            peers: {
                you: client.id,
                clients: clients.map(client => {
                    return {
                        id: client.id,
                        state: client.state
                    }
                })
            }
        });
    });
}

ws.on('connection', conn => {
    console.log('Connection established');
    const client = createClient(conn);

    conn.on('message', msg => {
        console.log('Message received', msg);
        const data = JSON.parse(msg);

        if (data.type === 'create-session') {
            const session = createSession();
            session.join(client);
            client.state = data.state;
            client.send({
                type: 'session-created',
                id : session.id
            });
        } else if (data.type === 'join-session') {
            const session = getSession(data.id) || createSession(data.id);
            session.join(client);
            client.state = data.state;
            broadcastSession(session);
        } else if (data.type === 'state-update') {
            const [prop, value] = data.state;
            client.state[data.fragment][prop] = value;
            client.broadcast(data);
        }
    })

    conn.on('close', () => {
        console.log('Connection closed');
        const session = client.session;
        if (session) {
            session.leave(client);
            if (session.clients.size === 0) {
                sessions.delete(session.id);
            }
        }
        broadcastSession(session);
    });
});