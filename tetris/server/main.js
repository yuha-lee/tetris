const http = require('http');
const WebSocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.all('/*', function(req, res) {
    const path = req.url.substr(1, req.url.length);
    if (req.method === 'POST') {
        fs.readFile('./playground.html', 'utf8', function(error, data) {
            if (error) {
                return console.error(error);
            }

            const sessionName = "<input type='hidden' id='sessionName' value='" + req.body.sessionName + "'>";
            data = data.replace(/<(\/input|input)([^>]*)>/gi, sessionName);

            fs.writeFile('./playground.html', data, 'utf8', function (error) {
                if (error) {
                    return console.log(error);
                }
             });

            fs.readFile('./playground.html', (error, data) => {
                if (error) {
                    return console.error(error);
                }
                res.end(data, 'utf-8');
            });
        });
    } else {
        fs.readFile(path, (error, data) => {
            if (error) {
                return console.error(error);
            }
            res.end(data, 'utf-8');
        });
    }
});

const server = http.createServer(app).listen(9000);
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

function createSession(id = createId(), name = 'tetris') 
{
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }
    console.log(name);
    const session = new Session(id, name);
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
            const session = createSession(data.id, data.name);
            session.join(client);
            client.state = data.state;
            client.send({
                type: 'session-created',
                id: session.id,
            });
        } else if (data.type === 'join-session') {
            const session = getSession(data.id) || createSession(data.id);
            if (session.clients.size >= 5) {
                client.send({
                    type: 'join-failed',
                    content: 'Cannot join the game: the game session is full'
                });
            }
            session.join(client);
            client.state = data.state;
            broadcastSession(session);
        } else if (data.type === 'state-update') {
            const [prop, value] = data.state;
            client.state[data.fragment][prop] = value;
            client.broadcast(data);
        } else if (data.type === 'chat') {
            client.broadcast({
                type: 'chat',
                id: client.id,
                content: data.content
            });
        } else if (data.type === 'show-sessions') {
            if (sessions.size > 0) {
                for (let session of sessions) {
                    client.send({
                        type: 'sessions',
                        content: JSON.stringify(session)
                    });
                }
            } else {
                client.send({
                    type: 'no-sessions',
                    content: 'No sessions available'
                });
            }
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
            broadcastSession(session);
        }
    });
});