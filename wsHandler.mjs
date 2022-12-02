const clientId = sessionStorage.getItem('clientId') || 'client-' + Math.random().toString(10).slice(2, 10);
if(sessionStorage.getItem('clientId') === null) sessionStorage.setItem('clientId', clientId);

var ws;
var isConnected = false
var printConsole = true

const incomingMessage = new EventTarget();
const connected = new EventTarget();

//'localhost'
const host = 'alexandrabucidefier.go.ro' //'192.168.0.3'

function connect() {
    ws = new WebSocket(`ws://${host}:81`, clientId);

    ws.onopen = () => {
        isConnected = true;
        if (printConsole) console.log('connected!');
        ws.send(clientId);
        connected.dispatchEvent(new Event('connected'));
    }

    ws.onclose = () => {
        isConnected = false;
        ws = null;
        connected.dispatchEvent(new Event('disconnected'));
        if (printConsole) console.log('disconnected!');
    }

    ws.onmessage = (message) => {
        if (printConsole) console.log(`Received message => ${message.data}`);
        incomingMessage.dispatchEvent(new CustomEvent('message', { detail: message.data }));
    }
}

function send(text) {
    if (!text) return;
    if (!ws) {
        if (printConsole) console.log('not connected!');
        return;
    }
    if (printConsole) console.log('Sending =>', text);
    ws.send(text);
}

function disconnect() {
    ws?.close();
}


export {
    connect, send, disconnect, incomingMessage,
    isConnected, printConsole, connected,
    clientId as id
};