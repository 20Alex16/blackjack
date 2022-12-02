// import event emitter
import { EventEmitter } from 'events';

const maxPlayers = 2;

const GameState = Object.freeze({
    "waiting": 0,
    "started": 1,
    "finished": 2
});

const PossibleActions = Object.freeze({
    "stand": 1,
    "draw": 2,
});

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

class Player {
    // create an event emmiter
    misteryAdded = new EventEmitter();
    cardAdded = new EventEmitter();
    cardRemoved = new EventEmitter();
    alias = undefined;

    constructor(ws, id) {
        this.ws = ws;
        this.id = id;
        this.hand = [];
        this.mistery = 0;
    }

    getSum = () => this.hand.reduce((a, b) => a + b, 0) + this.mistery;

    addMistery(card) {
        this.mistery = card;
        this.ws.send(JSON.stringify({ action: 'add_mistery', card: card }));
        this.misteryAdded.emit('added', card);
    }

    addCard(card) {
        this.hand.push(card);
        this.ws.send(JSON.stringify({ action: 'add_card', card: card }));
        this.cardAdded.emit('added', card);
    }

    removeCard(card) {
        this.hand = this.hand.filter(c => c != card);
        this.ws.send(JSON.stringify({ action: 'remove_card', card: card }));
        this.cardRemoved.emit('removed', card);
    }

    disconnect() {
        this.ws?.close();
    }
}

class GameRoom {
    players = [] // list of players
    playerTurn = 0
    deck = []
    gameState = GameState.waiting
    actions = [];

    constructor(m) {
        this.initializeGame();

        m.on('message', (received) => {
            let message = received.data;
            let clientId = received.clientId;
            let player = this.players.find(p => p.id == clientId);
            if (!player) return;

            var data;
            try {
                data = JSON.parse(message);
            } catch (e) {
                console.log("Error parsing client message", e, message);
                return;
            }

            switch (data.action) {
                case 'draw_card':
                    // console.log('HIT');
                    // player.addCard(this.deck.pop());

                    // // inform other players by card added
                    // this.players.forEach(p => {
                    //     if (p.id != player.id) {
                    //         p.cardAdded.emit('player_draw', player.id, player.hand[player.hand.length - 1]);
                    //     }
                    // });

                    this.addCardToPlayer(player, this.deck.pop());

                    this.actions.push(PossibleActions.draw);
                    if(!this.checkActions()){
                        this.nextTurn();
                        this.broadcastTurn();
                    }
                    break;

                case 'stand':
                    // console.log('STAND');

                    this.actions.push(PossibleActions.stand);
                    if(!this.checkActions()){
                        this.nextTurn();
                        this.broadcastTurn();
                    }
                    break;

                case 'alias': // set alias for player
                    player.alias = data.alias;
                    // broadcast his alias to other players
                    // console.log('alias', player.alias);
                    this.players.forEach(p => {
                        if (p.id != player.id) {
                            p.ws.send(JSON.stringify({ action: 'alias', id: player.id, alias: player.alias }));
                        }
                    });
                    break;

                default:
                    console.log('Unknown action', data.action);
                    break;
            };

            // if (this.actions.length == this.players.length) {
            //     this.checkActions();
            //     this.actions.shift();
            // }
        });
    }

    initializeGame() {
        this.gameState = GameState.waiting;
        this.actions = [];

        this.players.forEach(p => {
            p.disconnect();
        });

        this.players = [];
    }

    addCardToPlayer(p, card) {
        p.addCard(card);

        this.players.forEach(player => {
            if (player.id != p.id) {
                player.ws.send(JSON.stringify({ action: 'player_draw', player: p.id, card: card }));
            }
        });

        if (this.deck.length == 0) {
            this.declareWinner();
        }
    }

    addMisteryToPlayer(p, card) {
        p.addMistery(card);

        // inform other players by card added
        this.players.forEach(player => {
            if (player.id != p.id) {
                player.ws.send(JSON.stringify({ action: 'player_draw_mistery', player: p.id }));
            }
        });
    }

    startGame() {
        this.deck = this.generateDeck();

        this.playerTurn = 0;
        this.gameState = GameState.started;
        this.broadcastGameState();

        this.players.forEach(p => {
            this.addMisteryToPlayer(p, this.deck.pop());
            this.addCardToPlayer(p, this.deck.pop());
        });

        this.broadcastTurn();
    }

    nextTurn() {
        this.playerTurn = (this.playerTurn + 1) % this.players.length;
    }

    getPlayerByTurn() {
        return this.players[this.playerTurn];
    }

    broadcastTurn() {
        this.players.forEach((p, index) => {
            p.ws.send(JSON.stringify({ action: 'turn', turn: index == this.playerTurn }));
        });
    }

    broadcastGameState() {
        this.players.forEach(p => {
            p.ws.send(JSON.stringify({ action: 'game_state', state: this.gameState }));
        });
    }

    declareWinner() {
        let sortedPlayers = this.players
            .filter(a => a.getSum() <= 21)
            .sort((b,a) => a.getSum() - b.getSum());

        if(sortedPlayers.length == 0) {
            console.log('Tie');
            this.players.forEach(p => {
                p.ws.send(JSON.stringify({ action: 'conclude', winner: 'tie' }));
            });
            return;
        }
        
        let winner = sortedPlayers[0];
        if(sortedPlayers.length > 1 && winner.getSum() == sortedPlayers[1].getSum()) {
            this.players.forEach(p => {
                p.ws.send(JSON.stringify({ action: 'conclude', winner: 'tie' }));
            });
            return;
        }

        this.players.forEach(p => {
            p.ws.send(JSON.stringify({ action: 'conclude', winner: p.id == winner.id }));
        });
        this.broadcastGameState();
    }

    checkActions() {
        if(this.actions.length == this.players.length) {
            let stand = this.actions.filter(a => a == PossibleActions.stand);
            if (this.actions.length == stand.length) {
                // console.log('All players stand');
                // if everyone stands, this means the game is over
                this.gameState = GameState.finished;
                // declare winner
                this.declareWinner();
                return true;
            }
            this.actions.shift();
            return false;
        }else return false;
    }

    generateDeck() {
        let deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        shuffle(deck);

        return deck;
    }

    returnToDeck(card) {
        this.deck.push(card);
        shuffle(this.deck);
    }

    addPlayer(p) {
        if (this.players.length >= maxPlayers) {
            p.ws.send(JSON.stringify({ action: 'error', message: 'Game is full' }));
            p.ws.close();
            return false;
        };

        // tell this player who is he playing with
        p.ws.send(JSON.stringify({
            action: 'players',
            players: this.players.map(p => p.id)
        }));

        // send this player all the aliases
        this.players.forEach(player => {
            p.ws.send(JSON.stringify({
                action: 'alias',
                id: player.id,
                alias: player.alias
            }));
        });

        // tell other players that a new player has joined
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                action: 'player_joined',
                players: [p.id]
            }));
            // also send alias
            player.ws.send(JSON.stringify({
                action: 'alias',
                id: p.id,
                alias: p.alias
            }));
        });

        this.players.push(p);

        p.ws.on('close', () => {
            this.removePlayer(p);
        });
    }

    removePlayer(p) {
        // this.gameState = GameState.waiting;
        // this.broadcastGameState();

        this.gameState = GameState.waiting;

        this.deck = this.deck.concat(p.hand);
        shuffle(this.deck);

        this.players = this.players.filter(player => player.id != p.id);
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                action: 'player_left',
                players: [p.id]
            }));
        });

        this.actions.shift(); // remove one entry since player left

        this.playerTurn = this.playerTurn % this.players.length;
        this.broadcastGameState();
    }
}

export { Player, GameRoom, GameState, PossibleActions, maxPlayers };
