// const ws = require('ws');
// import WebSocketServer from 'ws';
// var wss = WebSocket.Server;

import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

var printConsole = false

const server = new WebSocketServer({ port: 8080 });
var clients = {};
const clientsChanged = new EventEmitter();
const incomingMessage = new EventEmitter();
// var clientsChanged = new CustomEvent('changed', {bubbles: true});

function triggerClientChange() {
    clientsChanged.emit('changed', { clients: clients });
}

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
                triggerClientChange();
            }
            if (printConsole) console.log(`Client ${message} connected!`);
        } else {
            incomingMessage.emit('message', { ws: ws, data: String(message), clientId: getClientId(ws) });
        }
    });

    ws.on('close', () => {
        if (printConsole) console.log('Client disconnected');
        var keys = Object.keys(clients);
        for (var i = 0; i < keys.length; i++) {
            if (clients[keys[i]].ws === ws) {
                delete clients[keys[i]];
                // clients[keys[i]] = null;
                triggerClientChange();
                break;
            }
        }
    });
});

server.on('close', (ws) => {
    if (printConsole) console.log('disconnect');
});

export { clients, clientsChanged, incomingMessage };
