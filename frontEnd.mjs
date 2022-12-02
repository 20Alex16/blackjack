var enemies = []; // a table with divs of template
var player = {};

var enemyTemplate;
var wrapper;

var hit = new EventTarget();
var stand = new EventTarget();

function initPlayers(){
    wrapper = document.querySelector('.wrapper');
    enemyTemplate = document.getElementsByTagName('template')[0].content.querySelector('#enemy');

    player.tray = document.querySelector('.tray.player');
    player.hit = document.querySelector('.hit');
    player.stand = document.querySelector('.stand');
    player.sum_label = document.querySelector('#psum');
    player.sum_label.innerText = '0 / 21';

    player.hit.addEventListener('click', () => {
        hit.dispatchEvent(new Event('hit'));
    });

    player.stand.addEventListener('click', () => {
        stand.dispatchEvent(new Event('stand'));
    });
}

function setAlias(id){
    let element = document.querySelector('.player-title')
    // create a new h2 element and insert if after 'element'
    let label = document.createElement('h2');
    label.innerText = id;
    element.parentElement.appendChild(label);

}

document.addEventListener('DOMContentLoaded', () => {
    initPlayers();
});

function setAliasFor(enemy_id, alias){
    let enemy = enemies.find(e => e.id == enemy_id);
    if(enemy) enemy.querySelector('.enemy-title').innerText = alias;
}

function addEnemy(enemy_id){
    // console.log(enemyTemplate)
    let element = enemyTemplate.cloneNode(true);
    element.id = enemy_id;
    
    let label = document.createElement('h2');
    label.innerText = enemy_id;
    label.classList.add('enemy-title');
    element.querySelector('h2').parentElement.appendChild(label);

    element.querySelector(".sum").innerText = '0 / 21';
    wrapper.insertBefore(element, wrapper.firstChild);
    enemies.push(element);
}


function player_addCard(card){
    const element = document.createElement('div');
    element.classList.add('card');
    element.innerText = card;
    player.tray.appendChild(element);

    calculateSums();
}

function player_addMistery(card){
    const element = document.createElement('div');
    element.classList.add('card');
    element.setAttribute('hidden', '');
    element.setAttribute('revealed', card);
    player.tray.appendChild(element);

    calculateSums();
}

function calculateSums(){
    // calculate player sum
    let sum = 0;
    player.tray.querySelectorAll('.card').forEach((element) => {
        if(element.hasAttribute('revealed'))
            sum += parseInt(element.getAttribute('revealed'));
        else
            sum += parseInt(element.innerText);
    });
    player.sum_label.innerText = sum + ' / 21';

    // now calculate enemy sums
    enemies.forEach((enemy) => {
        let sum = 0;
        enemy.querySelectorAll('.card').forEach((element) => {
            if(!element.hasAttribute('hidden'))
                sum += parseInt(element.innerText);
        });
        enemy.querySelector('.sum').innerText = '? + ' + sum + ' / 21';
    });
}

function enemy_addCard(enemy_id, card){
    const enemy = document.getElementById(enemy_id);
    const element = document.createElement('div');
    element.classList.add('card');
    element.innerText = card;
    enemy.querySelector('.tray').appendChild(element);

    calculateSums();
}

function enemy_addMistery(enemy_id){
    const enemy = document.getElementById(enemy_id);
    const element = document.createElement('div');
    element.classList.add('card');
    element.setAttribute('hidden', '');
    enemy.querySelector('.tray').appendChild(element);
}

function removeEnemy(enemy_id){
    let element = document.getElementById(enemy_id);
    if (element) element.remove();
}

function removeEnemies(){
    enemies.forEach((element) => {
        element.remove();
    });
    enemies = [];
}


function clearDecks(){
    player.tray.querySelectorAll(':not(.hit):not(.stand)').forEach((element) => {
        element.remove();
    });
    enemies.forEach(e => {
        e.querySelector('.tray').querySelectorAll(':not(.hit):not(.stand)').forEach((element) => {
            element.remove();
        });
    });
}

function setTurn(state){
    if(state){
        player.hit.classList.remove('inactive');
        player.stand.classList.remove('inactive');
    }
    else{
        player.hit.classList.add('inactive');
        player.stand.classList.add('inactive');
    }
}

export { player_addCard, player_addMistery, // inner workings
    enemy_addCard, enemy_addMistery, // inner workings
    setAlias, setAliasFor, // alias
    clearDecks, addEnemy, removeEnemy, removeEnemies, // visible stuff
    hit, stand, // events
    setTurn, // turn    true|false
};
