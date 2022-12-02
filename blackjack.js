import * as wsHandler from "./wsHandler.mjs";
import * as frontEnd from "./frontEnd.mjs";

wsHandler.connect();

setInterval(() => {
    if (!wsHandler.isConnected) {
        console.log('Attempting to connect...');
        wsHandler.connect();
    }
}, 5000);

const GameState = Object.freeze({
    "waiting": 0,
    "started": 1,
    "finished": 2
});

var gameState = GameState.waiting;

///// GAME VARIABLES /////

var playerTurn = false;

var alias;
if(!sessionStorage.getItem('alias')){
    alias = prompt('What is your name? (25 characters)').replace(/ /g, '_').replace(/\\/g,'');
    alias = alias.substring(0, 25);
    sessionStorage.setItem('alias', alias);
}
else alias = sessionStorage.getItem('alias');

//////////////////////////

document.addEventListener('DOMContentLoaded', () => {
// frontEnd.ready.addEventListener('ready', () => {
    // frontEnd.setClientId(wsHandler.id);
    frontEnd.setAlias(alias.replace(/_/g, ' '));

    wsHandler.connected.addEventListener('connected', () => {
        console.log('connected');
        wsHandler.send(JSON.stringify({
            action: 'alias',
            alias: alias
        }));
    });

    wsHandler.connected.addEventListener('disconnected', () => {
        console.log('disconnected');
    });

    wsHandler.incomingMessage.addEventListener('message', (data) => {
        // console.log("Server =>", data.detail);
        try {
            let message = JSON.parse(data.detail);
            switch (message.action) {
                case 'add_mistery':
                    if (gameState != GameState.started) break;
                    frontEnd.player_addMistery(message.card);
                    break;

                case 'add_card':
                    if (gameState != GameState.started) break;
                    frontEnd.player_addCard(message.card);
                    break;

                case 'conclude':
                    // console.log(message.winner);
                    switch(message.winner){
                        case 'tie':
                            alert('Tie!');
                            break;
                        case true:
                            alert('You win!');
                            break;
                        case false:
                            alert('You lose!');
                            break;

                        default:
                            alert('Unknown winner');
                    };
                    frontEnd.setTurn(false);
                break;

                case 'error':
                    alert(message.message);
                    break;

                case 'game_state':
                    gameState = message.state;
                    if (gameState != GameState.finished){
                        // frontEnd.removeEnemies();
                        frontEnd.clearDecks();
                    }
                    break;

                case 'alias':
                    frontEnd.setAliasFor(message.id, message.alias.replace(/_/g, ' '));
                    break;

                case 'turn':
                    if (gameState != GameState.started) break;
                    playerTurn = message.turn;
                    frontEnd.setTurn(playerTurn);
                    // TODO : announce turn
                    console.log(message.turn ? "Your turn" : "Not your turn");
                    break;

                case 'player_joined':
                case 'players':
                    message.players.forEach(id => {
                        frontEnd.addEnemy(id)
                    });
                    break;

                case 'player_left':
                    // reload page
                    location.reload();

                    // frontEnd.setTurn(false);
                    // message.players.forEach(id => {
                    //     frontEnd.removeEnemy(id);
                    // });
                    break;

                case 'player_draw':
                    frontEnd.enemy_addCard(message.player, message.card);
                    break;

                case 'player_draw_mistery':
                    frontEnd.enemy_addMistery(message.player);
                    break;

                default:
                    console.log("Unknown action:", message.action);
                    break;
            }

        }
        catch (e) {
            console.log(e);
            console.log("Error parsing JSON, data:", data.detail);
        }
    });

    frontEnd.hit.addEventListener('hit', () => {
        if(!playerTurn || gameState != GameState.started) return;
        playerTurn = false;
        wsHandler.send(JSON.stringify({ action: 'draw_card' }));
    });
    
    frontEnd.stand.addEventListener('stand', () => {
        if(!playerTurn || gameState != GameState.started) return;
        playerTurn = false;
        wsHandler.send(JSON.stringify({ action: 'stand' }));
    });

    // frontEnd.player_addMistery(1);
    // frontEnd.player_addCard(2);
    // frontEnd.player_setSum(3);

    // frontEnd.enemy_addMistery();
    // frontEnd.enemy_addCard(2);
    // frontEnd.enemy_setSum(3);
});