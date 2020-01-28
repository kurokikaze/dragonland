import {pathOr} from 'ramda';

export function isOurTurn(state) {
    return state.activePlayer === window.playerId;
}

export function isPromptActive(state) {
    return state.prompt;
}

export function zoneContent(zoneId, state) {
    return pathOr([], ['zones', zoneId], state);
}