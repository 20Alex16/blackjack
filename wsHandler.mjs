const clientId = 'client-' + Math.random().toString(10).slice(2, 10);
var ws;
var isConnected = false

// make a custom event for incoming messages
const incomingMessage = new CustomEvent('message');
const host = '192.168.0.103'

function connect() {
    ws = new WebSocket(`ws://${host}:8080`, clientId);

    ws.onopen = () => {
        isConnected = true;
        console.log('connected!');
        ws.send(clientId);
    }

    ws.onclose = () => {
        isConnected = false;
        ws = null;
        console.log('disconnected!');
    }

    ws.onmessage = (message) => {
        console.log(`Received message => ${message.data}`);
    }
}

function send(text) {
    if (!text) return;
    if (!ws) {
        console.log('not connected!');
        return;
    }
    console.log('Sending =>', text);
    ws.send(text);
}

function disconnect() {
    ws?.close();
}


export { connect, send, disconnect, incomingMessage, isConnected };