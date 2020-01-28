var express = require('express');
var nanoid = require('nanoid');
var moonlands = require('moonlands');

const {
    ACTION_PLAY,
    ACTION_EFFECT,

    EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
    EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
    EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,

    ZONE_TYPE_HAND,
    ZONE_TYPE_IN_PLAY,
} = require('moonlands/src/const');

const ACTION_DISPLAY = 'actions/display';
const ZONE_UPDATE = 'subtypes/zone_update';

var router = express.Router();

var runningGames = {};

function expandDuplicates(str) {
    const number = str[0];
    if (number.match(/\d/)) {
        return Array(parseInt(number)).fill(str.substr(2));
    }

    return [str];
}

function constructDeck(strings) {
    let deck = [];
    strings.forEach(str => {
        deck = [
            ...deck,
            ...expandDuplicates(str),
        ];
    });

    return deck;
}

function createGame(playerOne, playerTwo, deckOne, deckTwo) {
    const gameId = nanoid();

    const zones = [];

    const gameState = new moonlands.State({
        zones,
        step: null,
        activePlayer: playerOne,
    });

    gameState.setPlayers(playerOne, playerTwo);

    gameState.setDeck(
        playerOne,
        deckOne,
    );

    gameState.setDeck(
        playerTwo,
        deckTwo,
    );

    runningGames[gameId] = gameState;

    return gameId;
}

console.log('API router');
console.dir(express.get);
console.dir(router);
console.log(`const: ${ACTION_PLAY}`);
/* GET home page. */

router.post('/start', function(req, res) {
    const playerOne = parseInt(req.body.playerOne || '1', 10);
    const playerTwo = parseInt(req.body.playerTwo || '2', 10);

    const deckOne = constructDeck(
        req.body.deckOne.split('\r\n'),
    );

    const deckTwo = constructDeck(
        req.body.deckTwo.split('\r\n'),
    );

    const gameId = createGame(
        playerOne,
        playerTwo,
        deckOne,
        deckTwo,
    );

    runningGames[gameId].setup();

    res.json({
        gameId,
        result: 'OK',
    });
});

var ioLaunched = false;

router.get(/^\/game\/([a-zA-Z0-9_-]+)\/(\d)$/, function(req, res) {
    const gameId = req.params[0];
    const playerId = req.params[1];

    if (!ioLaunched) {
        const io = req.app.get('io');

        console.log('Running games:');
        console.dir(Object.keys(runningGames));

        io.on('connection', function(socket){
            const gameId = socket.handshake.query.gameId;
            const playerId = socket.handshake.query.playerId;
            console.log(`Sent game id ${gameId}, player id ${playerId}`);
            console.log('Running games:');
            console.dir(Object.keys(runningGames));
            runningGames[gameId].enableDebug();
            runningGames[gameId].actionStreamOne.on('action', action => 
            {
                socket.emit('action', action);
                if (action.type == ACTION_EFFECT) {
                    switch(action.effectType) {
                        case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
                            const player = action.destinationCard.owner;
                            const sourceZoneContent = runningGames[gameId].getZone(
                                action.sourceZone, 
                                (action.sourceZone == ZONE_TYPE_IN_PLAY) ? null : player,
                            ).serialize();

                            const destinationZoneContent = runningGames[gameId].getZone(
                                action.destinationZone,
                                (action.destinationZone == ZONE_TYPE_IN_PLAY) ? null : player,
                            ).serialize();

                            socket.emit('display', {
                                subtype: ZONE_UPDATE,
                                zoneType: action.sourceZone,
                                player,
                                content: sourceZoneContent,
                            });

                            socket.emit('display', {
                                subtype: ZONE_UPDATE,
                                zoneType: action.destinationZone,
                                player,
                                content: destinationZoneContent,
                            });
                            break;
                        }
                        case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
                            console.dir(action.from);
                            const from = (typeof action.from == 'string') ?
                                runningGames[gameId].getMetaValue(action.from, action.generatedBy) :
                                action.from;

                            socket.emit('display', {
                                subtype: 'subtypes/pay_energy_for_creature',
                                amount: action.amount,
                                from: (from.length) ? from[0].id : from.id,
                            });
                            break;
                        }
                        case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
                            const target = (typeof action.target == 'string') ?
                                runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
                                action.target;

                            socket.emit('display', {
                                subtype: 'subtypes/add_energy_to_magi',
                                amount: action.amount,
                                target: (target.length) ? target[0].id : target.id,
                            });
                            break;
                        }
                    }
                }
            });

            socket.on('action', action => {
                console.log('Client:');
                console.dir(action, null, 2);
                var expandedAction = {...action};
                switch (action.type) {
                    case ACTION_PLAY: {
                        const player = action.payload.player;
                        console.dir(runningGames[gameId].getZone(ZONE_TYPE_HAND, player).serialize());
                        const cardInHand = runningGames[gameId].getZone(ZONE_TYPE_HAND, player).byId(action.payload.card);
                        console.dir(cardInHand);
                        expandedAction.payload.card = cardInHand;
                        break;
                    }
                }
                // runningGames[gameId].commandStream.write(action);
                runningGames[gameId].update(action);
            });

            socket.on('disconnect', function(){
                console.log('user disconnected');
            });
        });

        ioLaunched = true;
    }

    res.render('game', {
        gameId,
        playerId,
        status: runningGames[gameId].serializeData(),
    });
});

module.exports = router;
