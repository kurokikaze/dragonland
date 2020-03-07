const {
	ACTION_PASS,
	ACTION_ENTER_PROMPT,
	ACTION_EFFECT,

	PROMPT_TYPE_CHOOSE_CARDS,
	PROMPT_TYPE_NUMBER,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_MOVE_ENERGY,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
} = require('moonlands/src/const');

const NUMBER_OF_STEPS = 6;

function convertServerCommand(action, game) {
	switch(action.type) {
		case ACTION_PASS: {
			const step = game.state.step;

			const newStep = (step === null) ? 0 : (step + 1) % NUMBER_OF_STEPS;

			action = {
				...action,
				newStep,
			};
			break;
		}
		case ACTION_ENTER_PROMPT: {
			switch(action.promptType) {
				case PROMPT_TYPE_CHOOSE_CARDS: {
					break;
				}
				case PROMPT_TYPE_NUMBER: {
					action.min = game.getMetaValue(action.min, action.generatedBy);
					action.max = game.getMetaValue(action.max, action.generatedBy);
				}
			}
			break;
		}
		case ACTION_EFFECT: {
			switch(action.effectType) {
				case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;
					from.card = from.card.card;

					action = {
						...action,
						from,
					};
					break;
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;
					from.card = from.card.card;

					action = {
						...action,
						from,
					};
					break;
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;
					target.card = target.card.card;

					action = {
						...action,
						target,
						amount,
					};
					break;
				}
				case EFFECT_TYPE_MOVE_ENERGY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const target = (targetCard.length) ? targetCard[0] : targetCard;
					target.card = target.card.card;

					const sourceCard = (typeof action.source == 'string') ?
						game.getMetaValue(action.source, action.generatedBy) :
						action.source;

					const source = (sourceCard.length) ? sourceCard[0] : sourceCard;
					source.card = source.card.card;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					action = {
						...action,
						target,
						source,
						amount,
					};
					break;
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;
					target.card = target.card.card;

					action = {
						...action,
						target,
						amount,
					};
					break;
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;
					target.card = target.card.card;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					action = {
						...action,
						target,
						amount,
					};
					break;
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;
					target.card = target.card.card;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					action = {
						...action,
						target,
						amount,
					};
					break;
				}
			}
			break;
		}
	}
	return action;
}

module.exports = convertServerCommand;
