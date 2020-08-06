const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const GameStore = require('./entities/game-store');
const gameStore = new GameStore();

server.listen(port, host, () => {
    console.log('Server listening at %s:%d', host, port);
});

app.use(express.static(path.join(__dirname, '../client')));


io.on('connection', (socket) => {

    const game = gameStore.getLatestWithFreePlaces();

    game.addPlayer(socket);

    if (game.hasFreePlaces() === false) {
        game.createMap({
            width: 8,
            height: 9,
            boxPercentage: 60
        });
        game.start();
    }


    socket.on('move', (direction) => {
        game.movePlayer(socket, direction);
    });

    socket.on('set-bomb', () => {
         game.setPlayerBomb(socket);
    });
});
