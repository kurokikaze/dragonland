import { byName } from 'moonlands/dist/cards.js';

export function camelCase(str){
	return str.replace(/'/g, '').split(' ').map(function(word, index){
		// If it is the first word make sure to lowercase all the chars.
		if(index == 0){
			return word.toLowerCase();
		}
		// If it is not the first word only upper case the first char and lowercase the rest.
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('');
}

const onlyCardsWithStaticAbilities = card => byName(card.card).data.staticAbilities;
const addCardData = card => ({...card, card: byName(card.card)});

export function enrichState(state, playerId) {
	const result = {
		...state,
		staticAbilities: [
			...state.zones.inPlay.filter(onlyCardsWithStaticAbilities).map(addCardData),
			...state.zones.playerActiveMagi.filter(onlyCardsWithStaticAbilities).map(addCardData),
			...state.zones.opponentActiveMagi.filter(onlyCardsWithStaticAbilities).map(addCardData),
		],
		packs: [],
		playerId,
	};

	return result;
}
