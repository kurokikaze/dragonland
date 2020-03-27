const {
	ACTION_PASS,
	ACTION_ENTER_PROMPT,
	ACTION_EFFECT,
	ACTION_POWER,

	PROMPT_TYPE_NUMBER,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY,
	EFFECT_TYPE_MOVE_ENERGY,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
} = require('moonlands/src/const');
const {clone} = require('./index');

const NUMBER_OF_STEPS = 6;

const index = (obj, is, value) => {
	if (typeof is == 'string')
		is =is.split('.');
	if (is.length == 1 && value !== undefined)
		return obj[is[0]] = value;
	else if (is.length == 0)
		return obj;
	else
		return index(obj[is[0]], is.slice(1), value);
};

const templateMessage = (message, metadata) => {
	return message.replace(/\$\{(.+?)\}/g, (match, p1) => index(metadata, p1));
};

const convertCard = cardInGame => ({
	id: cardInGame.id,
	owner: cardInGame.owner,
	card: cardInGame._card.name,
	data: cardInGame.data,
});

function convertServerCommand(initialAction, game) {
	var action = clone(initialAction);
	switch(action.type) {
		case ACTION_PASS: {
			const step = game.state.step;

			const newStep = (step === null) ? 0 : (step + 1) % NUMBER_OF_STEPS;

			return {
				...action,
				newStep,
			};
		}
		case ACTION_ENTER_PROMPT: {
			const actionSource = game.getMetaValue(action.source, action.generatedBy);
			if (action.source) {
				action.source = convertCard(actionSource);
			}

			if (action.message && action.generatedBy) {
				const metaData = game.getSpellMetadata(action.generatedBy);
				action.message = templateMessage(action.message, metaData);
			}

			switch(action.promptType) {
				case PROMPT_TYPE_NUMBER: {
					action.min = game.getMetaValue(action.min, action.generatedBy);
					action.max = game.getMetaValue(action.max, action.generatedBy);
				}
			}
			break;
		}
		case ACTION_POWER: {
			const actionSource = game.getMetaValue(action.source, action.generatedBy);
			return {
				...action,
				source: convertCard(actionSource),
				power: action.power.name,
			};
		}
		case ACTION_EFFECT: {
			switch(action.effectType) {
				case EFFECT_TYPE_PAYING_ENERGY_FOR_POWER: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;

					return {
						...action,
						from: convertCard(from),
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;

					return {
						...action,
						from: convertCard(from),
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_MOVE_ENERGY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const target = (targetCard.length) ? targetCard[0] : targetCard;

					const sourceCard = (typeof action.source == 'string') ?
						game.getMetaValue(action.source, action.generatedBy) :
						action.source;

					const source = (sourceCard.length) ? sourceCard[0] : sourceCard;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target: convertCard(target),
						source: convertCard(source),
						amount,
					};
				}
				case EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
			}
			break;
		}
	}
	return action;
}

module.exports = convertServerCommand;
