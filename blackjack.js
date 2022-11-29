import * as wsHandler from "./wsHandler.mjs";
import * as frontEnd from "./frontEnd.mjs";

// establish a connection with server using wsHandler
wsHandler.connect();

document.addEventListener('DOMContentLoaded', () => {
    frontEnd.player_addMistery(1);
    frontEnd.player_addCard(2);
    frontEnd.player_setSum(3);

    frontEnd.enemy_addMistery();
    frontEnd.enemy_addCard(2);
    frontEnd.enemy_setSum(3);
});