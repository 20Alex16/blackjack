import * as wssHandler from "./wssHandler.mjs";
import * as gameCore from "./gameRoom.mjs";

// console.log(gameCore)
console.log("\n\n-----GAME STARTED-----\n");

var game = new gameCore.GameRoom(wssHandler.incomingMessage);

game.initializeGame();

wssHandler.clientsChanged.on('added', (data) => {
    if(gameCore.maxPlayers <= game.players.length) {
        let p = wssHandler.clients[data]
        p.ws.send(JSON.stringify({ action: 'error', message: 'Game is full' }));
        p.ws.close();
        return;
    }

    console.log("Client added:", data);

    let player = new gameCore.Player(wssHandler.clients[data].ws , data);
    game.addPlayer(player);

    if(gameCore.maxPlayers == game.players.length){
        game.startGame();
    }
});

wssHandler.clientsChanged.on('removed', (data) => {
    console.log("Client removed:", data);
});

wssHandler.incomingMessage.on('message', (data) => {
    // console.log(data.clientId + ' => ' + data.data);
});