// const ws = require('ws');
// import WebSocketServer from 'ws';
// var wss = WebSocket.Server;

import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

var printConsole = false

const server = new WebSocketServer({ port: 81 });
var clients = {};
const clientsChanged = new EventEmitter();
const incomingMessage = new EventEmitter();

function getClientId(client) {
    var keys = Object.keys(clients);
    for (var i = 0; i < keys.length; i++)
        if (clients[keys[i]].ws === client)
            return keys[i];

    return null;
}

function isClient(clientId) {
    clientId = String(clientId);
    if (typeof clientId != 'string') return false;
    return /^client-\d{8}$/.test(clientId);
}

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = String(message);
        if (printConsole) console.log(`Received message => ${message}`);

        if (isClient(message)) {
            var keys = Object.keys(clients);
            if (message in keys) {
                if (printConsole) console.log(`Client ${message} already exists!`);
                // ws.close();
                return;
            }
            else {
                clients[message] = { ws: ws };
                clientsChanged.emit('added', message); // send clientId
            }
            if (printConsole) console.log(`Client ${message} connected!`);
        } else {
            incomingMessage.emit('message', { ws: ws, data: message, clientId: getClientId(ws) });
        }
    });

    ws.on('close', () => {
        if (printConsole) console.log('Client disconnected');
        var keys = Object.keys(clients);
        for (var i = 0; i < keys.length; i++) {
            if (clients[keys[i]].ws === ws) {
                clientsChanged.emit('removed', keys[i]); // send clientId
                delete clients[keys[i]];
                // clients[keys[i]] = null;
                // triggerClientChange();
                break;
            }
        }
    });
});

server.on('close', (ws) => {
    if (printConsole) console.log('disconnect');
});

function broadcastAll(data) {
    var keys = Object.keys(clients);
    for (var i = 0; i < keys.length; i++) {
        clients[keys[i]].ws.send(data);
    }
}

function broadcastAllExcept(data, client) { // client is clientId
    var keys = Object.keys(clients);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] != client)
            clients[keys[i]].ws.send(data);
    }
}

export { clients, clientsChanged, incomingMessage, printConsole };
