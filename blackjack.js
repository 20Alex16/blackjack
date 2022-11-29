const menu = document.querySelector(".full-screen")
const p1btn = document.querySelector("#p1")
const p2btn = document.querySelector("#p2")

p1btn.addEventListener("click", () => {
    menu.style.transform = "translateX(100%)"
    playerTurn = 1
})

p2btn.addEventListener("click", () => {
    menu.style.transform = "translateX(-100%)"
    playerTurn = 2
})

////////////////////

const sw = document.querySelector("#switch")

sw.addEventListener("click", () => {
    toggleTurn()

    menu.style.transform = "translateX(0)"

    setTimeout(() => {
        if (playerTurn == 2)
            menu.style.transform = "translateX(-100%)"
        else
            menu.style.transform = "translateX(100%)"
    }, 3000)
})

///////////////////

const reset = document.querySelector("#reset")
reset.addEventListener("click", initGame)

/////////////////////

var playerTurn = 1
function toggleTurn() {
    if (playerTurn == 1) {
        playerTurn = 2
    } else {
        playerTurn = 1
    }
}

const [p1_draw, p2_draw] = document.querySelectorAll(".hit");
const [p1_tray, p2_tray] = document.querySelectorAll(".tray");

const p1sum = document.querySelector("#p1sum")
const p2sum = document.querySelector("#p2sum")

let gameState = false

deck = []

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

shuffle(deck)

function drawCard() {
    return deck.pop()
}

function putBackCard(card) {
    deck.push(card)
    shuffle(deck)
}

player1 = {
    draw_button: p1_draw,
    tray: p1_tray,
    cards: [], // populate with 1,2,3... 11
    sumLabel: p1sum,
    sum: 0,
    mistery: null,
    updateLabel: function () {
        this.sumLabel.innerHTML = `? + ${this.sum - this.mistery} / 21`
    },
    addCard: function () {
        let cardNo = drawCard()
        this.cards.push(cardNo)
        let card = document.createElement("div")
        card.classList.add("card")
        card.textContent = cardNo
        this.tray.appendChild(card)
        this.sum += cardNo
        this.updateLabel()
    },
    addMistery: function () {
        let card = document.createElement("div")
        card.classList.add("card")
        card.setAttribute("hidden", '')

        let cardNo = drawCard()
        this.tray.appendChild(card)
        this.sum += cardNo
        card.setAttribute("value", cardNo)
        this.mistery = cardNo

        this.tray.appendChild(card)
        // this.updateLabel()
    },
    addRevealed: function () {
        let card = document.createElement("div")
        card.classList.add("card")
        card.setAttribute("hidden", '')

        let cardNo = drawCard()
        this.tray.appendChild(card)
        this.sum += cardNo
        card.setAttribute("revealed", cardNo)
        card.setAttribute("value", cardNo)
        this.mistery = cardNo

        this.tray.appendChild(card)
        this.updateLabel()
    }
}

player2 = {
    draw_button: p2_draw,
    tray: p2_tray,
    cards: [], // populate with 1,2,3... 11
    sumLabel: p2sum,
    sum: 0,
    addCard: function () {
        let cardNo = drawCard()
        this.cards.push(cardNo)
        let card = document.createElement("div")
        card.classList.add("card")
        card.textContent = cardNo
        this.tray.appendChild(card)
        this.sum += cardNo
        this.sumLabel.innerHTML = this.sum + " / 21"
    },
    addMistery: function () {
        let card = document.createElement("div")
        card.classList.add("card")
        card.setAttribute("hidden", '')

        let cardNo = drawCard()
        this.tray.appendChild(card)
        this.sum += cardNo
        card.setAttribute("value", cardNo)
        this.mister = cardNo

        this.tray.appendChild(card)
    },
    addRevealed: function () {
        let card = document.createElement("div")
        card.classList.add("card")
        card.setAttribute("hidden", '')

        let cardNo = drawCard()
        this.tray.appendChild(card)
        this.sum += cardNo
        card.setAttribute("revealed", cardNo)
        card.setAttribute("value", cardNo)
        this.mistery = cardNo

        this.tray.appendChild(card)
    }
}

function initGame() {
    player1.cards = []
    player2.cards = []

    player1.tray.querySelectorAll(".card").forEach(card => card.remove())
    player2.tray.querySelectorAll(".card").forEach(card => card.remove())

    player1.sum = 0
    player2.sum = 0

    // player1.sumLabel.textContent = "0 / 21"
    // player2.sumLabel.textContent = "0 / 21"

    deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    shuffle(deck)

    gameState = true
    // add a card to each player

    player1.addMistery()
    player2.addRevealed()

    player1.addCard()
    player2.addCard()

    p1_draw?.remove()

}

p1_draw.addEventListener("click", function () {
    if (!gameState) return;
    player1.addCard()
});

p2_draw.addEventListener("click", function () {
    if (!gameState) return;
    player2.addCard()
});

initGame()