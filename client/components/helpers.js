import {
	TYPE_CREATURE,
	TYPE_MAGI,
} from 'moonlands/src/const.js';

export function canFirstAttackSecond(first, second) {
	return (first.data.controller !== second.data.controller) && second.card.type === TYPE_CREATURE ||
    (second.card.type === TYPE_MAGI && !second.guarded) ||
    (second.card.type === TYPE_MAGI && first.card.data.canAttackMagiDirectly);
}

export function canPackHuntWith(first, second) {
	return first.card.data.canPackHunt &&
        first.id !== second.id && // sadly being both drop source and target can sometimes cause this
        first.data.attacked < 1 && // actually should be < modifiedData.numberOfAttacks
        second.data.attacked < 1; // actually should be < modifiedData.numberOfAttacks 
}