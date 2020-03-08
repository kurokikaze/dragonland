const {
	ACTION_PLAY,
	ACTION_ATTACK,
	ACTION_POWER,
	ACTION_RESOLVE_PROMPT,

	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_MAGI,

	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
	ZONE_TYPE_ACTIVE_MAGI,
} = require('moonlands/src/const');
const {clone} = require('./index');

function convertClientCommands(action, game) {
	var expandedAction = clone(action);
	switch (action.type) {
		case ACTION_RESOLVE_PROMPT: {
			switch (game.state.promptType) {
				case PROMPT_TYPE_OWN_SINGLE_CREATURE: {
					expandedAction.target = game.getZone(ZONE_TYPE_IN_PLAY, null).byId(action.target);
					break;
				}
				case PROMPT_TYPE_SINGLE_CREATURE: {
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
			if (!expandedAction.target) {
				const opponentId = game.getOpponent(expandedAction.source.data.controller);
				expandedAction.target = game.getZone(ZONE_TYPE_ACTIVE_MAGI, opponentId).byId(action.target);
			}
			break;
		}
		case ACTION_PLAY: {
			const player = action.payload.player;
			const cardInHand = game.getZone(ZONE_TYPE_HAND, player).byId(action.payload.card);
			expandedAction.payload.card = cardInHand;
			break;
		}
	}

	return expandedAction;
}

module.exports = convertClientCommands;
