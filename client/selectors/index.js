import {pathOr} from 'ramda';

export function isOurTurn(state) {
    return state.activePlayer === window.playerId;
}

export function isPromptActive(state) {
    return state.prompt && state.promptPlayer === window.playerId;
}

export function getMagiEnergy(state) {
    return zoneContent('playerActiveMagi', state).length ? zoneContent('playerActiveMagi', state)[0].data.energy : 0;
}

export function zoneContent(zoneId, state) {
    return pathOr([], ['zones', zoneId], state);
}