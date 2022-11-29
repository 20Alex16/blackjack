// import all the things from wsHandler.mjs
import * as wsHandler from "./wsHandler.mjs";


document.addEventListener('DOMContentLoaded', () => {
    const send = document.querySelector('input[type="button"][value="send"]');
    const disconnect = document.querySelector('input[type="button"][value="disconnect"]');
    const connect = document.querySelector('input[type="button"][value="connect"]');
    const text = document.querySelector('input[type="text"]');


    connect.addEventListener('click', wsHandler.connect);


    send.addEventListener('click', () => {
        if (!text.value) return;
        wsHandler.send(text.value);
    });


    disconnect.addEventListener('click', () => {
        wsHandler.disconnect();
    });
});