import {
	ACTION_PLAY,
	ACTION_ATTACK,
	ACTION_POWER,
	ACTION_RESOLVE_PROMPT,

	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_MAGI,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_RELIC,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_MAGI_WITHOUT_CREATURES,

	PROPERTY_CONTROLLER,

	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
	ZONE_TYPE_ACTIVE_MAGI,
} from 'moonlands/dist/const.js';
import {clone} from './index.js';

function convertClientCommands(action, game) {
	var expandedAction = clone(action);
	switch (action.type) {
		case ACTION_RESOLVE_PROMPT: {
			switch (game.state.promptType) {
				case PROMPT_TYPE_RELIC: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_OWN_SINGLE_CREATURE: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_SINGLE_CREATURE: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_SINGLE_CREATURE_FILTERED: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					if (!expandedAction.target) {
						expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[0]).byId(action.target);
					}
					if (!expandedAction.target) {
						expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[1]).byId(action.target);
					}
					break;
				}
				case PROMPT_TYPE_SINGLE_MAGI: {
					expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[0]).byId(action.target);
					if (!expandedAction.target) {
						expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[1]).byId(action.target);
					}
					break;
				}
				case PROMPT_TYPE_MAGI_WITHOUT_CREATURES: {
					expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[0]).byId(action.target);
					if (!expandedAction.target) {
						expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[1]).byId(action.target);
					}
					break;
				}
				case PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE: {
					const zone = action.zone === ZONE_TYPE_IN_PLAY ? game.getZone(ZONE_TYPE_IN_PLAY) : game.getZone(action.zone, action.zoneOwner);
					const zoneContent = zone.cards;
					expandedAction.cards = zoneContent.filter(card => action.cards.includes(card.id));
					console.dir(expandedAction.cards[0]._card);
					break;
				}
			}
			// change target string to CardInGame
			break;
		}
		case ACTION_POWER: {
			expandedAction.source = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.source);
			if (!expandedAction.source) {
				expandedAction.source = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[0]).byId(action.source);
			}
			if (!expandedAction.source) {
				expandedAction.source = game.getZone(ZONE_TYPE_ACTIVE_MAGI, game.players[1]).byId(action.source);
			}
			expandedAction.power = expandedAction.source.card.data.powers.find(power => power.name === expandedAction.power);
			expandedAction.player = expandedAction.source.data.controller;
			break;
		}
		case ACTION_ATTACK: {
			expandedAction.source = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.source);
			expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);

			if (action.additionalAttackers) {
				expandedAction.additionalAttackers = action.additionalAttackers.map(id => game.getZone(ZONE_TYPE_IN_PLAY, null).byId(id));
			}

			if (!expandedAction.target) {
				const controller = game.modifyByStaticAbilities(expandedAction.source, PROPERTY_CONTROLLER);
				const opponentId = game.getOpponent(controller);
				expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, opponentId).byId(action.target);
			}

			break;
		}
		case ACTION_PLAY: {
			const player = action.payload.player;
			const cardInHand = game.getZone(ZONE_TYPE_HAND, player).byId(action.payload.card);
			expandedAction.payload.card = cardInHand;
			expandedAction.forcePriority = false;
			break;
		}
	}

	return expandedAction;
}

export default convertClientCommands;
