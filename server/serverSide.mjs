import * as wssHandler from "./wssHandler.mjs";

wssHandler.clientsChanged.on('changed', (data) => {
    console.log(data);
});

wssHandler.incomingMessage.on('message', (data) => {
    console.log(data);
});