const [p1_draw, p2_draw] = document.querySelectorAll(".hit");
const [p1_tray, p2_tray] = document.querySelectorAll(".tray");

deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

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

player1 = {
    draw_button: p1_draw,
    tray: p1_tray,
    cards: [], // populate with 1,2,3... 11
}

p1_draw.addEventListener("click", function () {
    dummyCard = document.createElement('div');
    dummyCard.className = 'card';
    dummyCard.innerHTML = Math.random().toString().substring(2, 4);
    p1_tray.appendChild(dummyCard);
});