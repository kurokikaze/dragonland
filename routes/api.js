var express = require('express');
var nanoid = require('nanoid');
var moonlands = require('moonlands');

function clone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

const {
    ACTION_PASS,
    ACTION_PLAY,
    ACTION_ATTACK,
    ACTION_EFFECT,

    EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
    EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
    EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,

    ZONE_TYPE_HAND,
    ZONE_TYPE_IN_PLAY,
    ZONE_TYPE_ACTIVE_MAGI,
} = require('moonlands/src/const');

const ACTION_DISPLAY = 'actions/display';
const ZONE_UPDATE = 'subtypes/zone_update';

const NUMBER_OF_STEPS = 6;

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
                switch(action.type) {
                    case ACTION_PASS: {
                        const step = runningGames[gameId].state.step;

                        const newStep = (step === null) ? 0 : (step + 1) % NUMBER_OF_STEPS;

                        action = {
                            ...action,
                            newStep,
                        };
                        break;
                    }
                    case ACTION_EFFECT: {
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
                                const fromCard = (typeof action.from == 'string') ?
                                    runningGames[gameId].getMetaValue(action.from, action.generatedBy) :
                                    action.from;
                                const from = (fromCard.length) ? fromCard[0] : fromCard;
                                from.card = from.card.card;

                                action = {
                                    ...action,
                                    from,
                                };
                                break;
                            }
                            case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
                                const targetCard = (typeof action.target == 'string') ?
                                    runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
                                    action.target;
                                
                                const target = (targetCard.length) ? targetCard[0] : targetCard;
                                target.card = target.card.card;

                                action = {
                                    ...action,
                                    target,
                                };
                                break;
                            }
                        }
                        break;
                    }
                }
                socket.emit('action', action);
            });

            socket.on('action', action => {
                console.log('Client:');
                console.dir(action, null, 2);
                var expandedAction = clone(action);
                switch (action.type) {
                    case ACTION_ATTACK: {
                        expandedAction.source = runningGames[gameId].getZone(ZONE_TYPE_IN_PLAY, null).byId(action.source);
                        expandedAction.target = runningGames[gameId].getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
                        if (!expandedAction.target) {
                            const opponentId = runningGames[gameId].getOpponent(expandedAction.source.data.controller);
                            expandedAction.target = runningGames[gameId].getZone(ZONE_TYPE_ACTIVE_MAGI, opponentId).byId(action.target);
                        }
                        break;
                    }
                    case ACTION_PLAY: {
                        const player = action.payload.player;
                        const cardInHand = runningGames[gameId].getZone(ZONE_TYPE_HAND, player).byId(action.payload.card);
                        expandedAction.payload.card = cardInHand;
                        break;
                    }
                }
                // runningGames[gameId].commandStream.write(action);
                runningGames[gameId].update(expandedAction);
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
