var enemy = {};
var player = {};

function initPlayers(){
    enemy.tray = document.querySelector('.tray.enemy');
    enemy.hit = document.querySelector('.hit.enemy');
    enemy.sum_label = document.querySelector('#p1sum');

    player.tray = document.querySelector('.tray.player');
    player.hit = document.querySelector('.hit.player');
    player.sum_label = document.querySelector('#p2sum');
}

document.addEventListener('DOMContentLoaded', () => {
    initPlayers();
});


function player_addCard(card){
    const element = document.createElement('div');
    element.classList.add('card');
    element.innerText = card;
    player.tray.appendChild(element);
}

function player_addMistery(card){
    const element = document.createElement('div');
    element.classList.add('card');
    element.setAttribute('hidden', '');
    element.setAttribute('revealed', card);
    player.tray.appendChild(element);
}

function player_setSum(sum){
    player.sum_label.innerText = sum + ' / 21';
}


function enemy_addCard(card){
    const element = document.createElement('div');
    element.classList.add('card');
    element.innerText = card;
    enemy.tray.appendChild(element);
}

function enemy_addMistery(){
    const element = document.createElement('div');
    element.classList.add('card');
    element.setAttribute('hidden', '');
    enemy.tray.appendChild(element);
}

function enemy_setSum(sum){
    enemy.sum_label.innerText = '? + ' + sum + ' / 21';
}

export { player_addCard, player_addMistery, player_setSum,
    enemy_addCard, enemy_addMistery, enemy_setSum };