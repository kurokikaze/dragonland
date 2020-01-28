import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import App from './components/App';
import rootReducer from './reducers';

$(document).ready(function(){
    console.log('Document ready');
    console.dir(document.getElementById('game'));
    const store = createStore(
        rootReducer,
        window.initialState,
        applyMiddleware(thunk),
    );
    ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>, document.getElementById('game'));
    window.socket = io(`/?gameId=${window.gameId}&playerId=${window.playerId}`);
    socket.on('action', function(action) {
        console.log('caught action');
        store.dispatch(action);
    });

    socket.on('display', function(action) {
        store.dispatch({
            type: 'actions/display',
            ...action,
        });
    })
});

/* const cardImage = name => `/images/cards/${camelCase(name)}.jpg`;

const createCard = cardData => {
    const cardImg = $('<img />').attr({
        src: cardImage(cardData.card),
    });

    const cardHolder = $('<div/>')
        .addClass('cardHolder')
        .attr({'data-id': cardData.id})
        .append(cardImg);

    cardHolder.append(
        $('<div>').addClass('cardEnergy').text(cardData.data.energy || '')
    );

    return cardHolder;
};

$(document).ready(function() {
    window.socket = io(`/?gameId=${window.gameId}&playerId=${window.playerId}`);

    socket.on('action', function(action) {
        if (action.type != 'actions/effect') return true;
        switch (action.effectType) {
            case 'effects/add_energy_to_creature': {
                const id = action.target.id;
                const card = $(`[data-id="${id}"]`);
                const cardEnergy = parseInt(card.find('.cardEnergy').text() || '0', 10);
                const newEnergy = cardEnergy + action.amount;
                card.find('.cardEnergy').text(newEnergy);
                break;
            }
        }
    })

    socket.on('display', function(action) {
        console.log('Display event');
        console.dir(action);
        switch(action.subtype) {
            case 'subtypes/pay_energy_for_creature': {
                const id = action.from;
                const card = $(`[data-id="${id}"]`);
                const cardEnergy = parseInt(card.find('.cardEnergy').text() || '0', 10);
                const newEnergy = cardEnergy - action.amount;
                card.find('.cardEnergy').text(newEnergy);
                break;
            }
            case 'subtypes/add_energy_to_magi': {
                const id = action.target;
                const card = $(`[data-id="${id}"]`);
                const cardEnergy = parseInt(card.find('.cardEnergy').text() || '0', 10);
                const newEnergy = cardEnergy + action.amount;
                card.find('.cardEnergy').text(newEnergy);
                break;
            }
            case 'subtypes/zone_update': {
                switch (action.zoneType) {
                    case 'zones/in_play': {
                        $('#playerInPlay').empty();
                        $('#opponentInPlay').empty();
                        action.content.forEach(cardData => {
                            const zoneSelector = (cardData.data.controller == window.playerId) ?
                                '#playerInPlay' :
                                '#opponentInPlay';

                            const cardHolder = createCard(cardData);

                            cardHolder.appendTo(zoneSelector);
                        });
                        break;
                    }
                    case 'zones/active_magi': {
                        const zoneSelector = (action.player == window.playerId) ? '#playerActiveMagi' : '#opponentActiveMagi';
                        $(zoneSelector).empty();
                        action.content.forEach(cardData => {
                            const cardHolder = createCard(cardData);

                            cardHolder.appendTo(zoneSelector);
                        });
                        break;
                    }
                    case 'zones/hand': {
                        const zoneSelector = (action.player == window.playerId) ? '#playerHand' : '#opponentHand';
                        $(zoneSelector).empty();
                        action.content.forEach(cardData => {
                            const cardHolder = createCard(cardData);

                            cardHolder.appendTo(zoneSelector);
                        });
                        break;
                    }
                }
                // end zone update
                break;
            }
        }
    });

    $('button#pass').click(function() {
        window.socket.emit('action', {type: 'actions/pass'});
    });

    window.enterCardPrompt = function(cards) {
        $('#overlay').show();
        $('#prompt .conditions').append(
            $('<div/>').addClass('zone')
        );

        const zoneSelector = '#prompt .conditions .zone';

        cards.forEach(card => {
            $('<img />').attr({
                src: cardImage(card),
            }).appendTo(zoneSelector);
            $(`<input type="checkbox" name="${card}" checked/>`).appendTo(zoneSelector);
        });
    }

    window.resolveCardPrompt = function () {

    }
});
*/