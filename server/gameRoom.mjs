import { WebSocketServer } from "ws";

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
    
    addMistery(card){
        this.mistery = card;
        this.misteryAdded.emit('added', card);
    }

    addCard(card){
        this.hand.push(card);
        this.cardAdded.emit('added', card);
    }

    removeCard(card){
        this.hand.pop();
        this.cardRemoved.emit('removed', card);
    }

    disconnect(){
        this.ws?.close();
    }
}

class GameRoom {
    players = {}
    deck = []
    gameState = GameState.started
    actions = [PossibleActions.stand, PossibleActions.stand];
    
    constructor() {
        this.initializeGame();
        // this.deck = this.generateDeck()
    }

    initializeGame() {
        this.gameState = GameState.started;
        this.deck = this.generateDeck();
        this.actions = [PossibleActions.stand, PossibleActions.stand];
        
        this.players.forEach(p => {
            this.removePlayer(p);
        });
        this.players = {};
    }

    generateDeck() {
        deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        shuffle(deck)
        
        return deck
    }

    returnToDeck(card) {
        this.deck.push(card);
        shuffle(this.deck);
    }
    
    addPlayer(p) {
        if(this.players.length > maxPlayers) return false;

        p.addMistery(this.deck.pop());
        this.players.push(p);
    }

    removePlayer(p) {
        deck = deck.concat(p.hand);
        this.players = this.players.filter(player => player !== p);
    }
}

