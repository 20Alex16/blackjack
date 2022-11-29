// import { WebSocketServer } from "ws";

const maxPlayers = 2;

const GameState = Object.freeze({
    "waiting": 1,
    "started": 2,
    "finished": 3
});

const PossibleActions = Object.freeze({
    "stand" : 1,
    "draw" : 2,
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

class Player{
    // create an event emmiter
    misteryAdded = new EventEmitter();
    cardAdded = new EventEmitter();
    cardRemoved = new EventEmitter();

    constructor(ws, id){
        this.ws = ws;
        this.id = id;
        this.hand = [];
        this.mistery = 0;
    }

    getSum = () => this.hand.reduce((a, b) => a + b, 0) + this.mistery;

    addMistery(card){
        this.mistery = card;
        this.ws.send(JSON.stringify({action: 'add_mistery', card: card}));
        this.misteryAdded.emit('added', card);
    }
    
    addCard(card){
        this.hand.push(card);
        this.ws.send(JSON.stringify({action: 'add_card', card: card}));
        this.cardAdded.emit('added', card);
    }
    
    removeCard(card){
        this.hand = this.hand.filter(c => c != card);
        this.ws.send(JSON.stringify({action: 'remove_card', card: card}));
        this.cardRemoved.emit('removed', card);
    }

    disconnect(){
        this.ws?.close();
    }
}

class GameRoom {
    players = {}
    deck = []
    gameState = GameState.waiting
    actions = [];
    
    constructor() {
        this.initializeGame();
    }

    initializeGame() {
        this.gameState = GameState.waiting;
        this.actions = [];
        
        this.players.forEach(p => {
            this.removePlayer(p);
        });
        this.players = {};
    }

    declareWinner() {
        let winner = this.players[0];
        this.players.forEach(p => {
            if(p.mistery > winner.mistery) {
                winner = p;
            }
        });

        this.players.forEach(p => {
            p.ws.send(JSON.stringify({action: 'winner', winner: winner.id}));
        });
    }

    checkActions() {
        let stand = this.actions.filter(a => a.action == PossibleActions.stand);
        if (this.actions.length == stand.length) {
            // if everyone stands, this means the game is over
            this.gameState = GameState.finished;
            // declare winner
            this.declareWinner();
        }
    }
    
    startGame() {
        this.deck = this.generateDeck();
        this.players.forEach(p => {
            p.addMistery(this.deck.pop());
            p.addCard(this.deck.pop());
        });

        this.gameState = GameState.started;
    }

    generateDeck() {
        deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        shuffle(deck);
        
        return deck;
    }

    returnToDeck(card) {
        this.deck.push(card);
        shuffle(this.deck);
    }
    
    addPlayer(p) {
        if(this.players.length > maxPlayers) return false;

        this.players.push(p);

        // p.addMistery(this.deck.pop());
        // p.addCard(this.deck.pop());

        p.ws.on('message', (message) => {
            let data = JSON.parse(message);
            if(data.action == 'draw_card') {
                p.addCard(this.deck.pop());
                this.actions.push({player: p, action: PossibleActions.draw});
            }
            if(data.action == 'stand') {
                this.actions.push({player: p, action: PossibleActions.stand});
            }

            if(this.actions.length == this.players.length) {
                this.checkActions();
                this.actions.shift();
            }
        });

        // when player disconnects
        p.ws.on('close', () => {
            this.removePlayer(p);
        });

        if(this.players.length == maxPlayers && this.gameState == GameState.waiting) {
            this.startGame();
        }
    }
    
    removePlayer(p) {
        deck = deck.concat(p.hand);
        this.players = this.players.filter(player => player !== p);
    }
}

