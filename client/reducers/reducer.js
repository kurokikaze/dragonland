import {
    ACTION_EFFECT,
    ACTION_ENTER_PROMPT,
    ACTION_RESOLVE_PROMPT,

    EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
    EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
    EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
    EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,

    ZONE_TYPE_ACTIVE_MAGI,
    ZONE_TYPE_MAGI_PILE,
    ZONE_TYPE_DEFEATED_MAGI,
    ZONE_TYPE_DECK,
    ZONE_TYPE_DISCARD,
    ZONE_TYPE_HAND,
    ZONE_TYPE_IN_PLAY,
} from 'moonlands/src/const';

const TYPE_DISPLAY = 'actions/display';

const SUBTYPE_ZONE_UPDATE = 'subtypes/zone_update';

const zoneNames = {
    [ZONE_TYPE_ACTIVE_MAGI]: 'ActiveMagi',
    [ZONE_TYPE_MAGI_PILE]: 'MagiPile',
    [ZONE_TYPE_DEFEATED_MAGI]: 'DefeatedMagi',
    [ZONE_TYPE_DECK]: 'Deck',
    [ZONE_TYPE_DISCARD]: 'Discard',
    [ZONE_TYPE_HAND]: 'Hand',
    [ZONE_TYPE_IN_PLAY]: 'InPlay',
}

export default (state = {}, action) => {
    switch (action.type) {
        case ACTION_ENTER_PROMPT: {
            return {
                ...state,
                prompt: true,
                promptType: action.promptType,
                promptParams: action.promptParams,
            };
        }
        case ACTION_RESOLVE_PROMPT: {
            return {
                ...state,
                prompt: false,
                promptType: null,
                promptParams: null,
            };
        }
        case ACTION_EFFECT: {
            switch(action.effectType) {
                case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
                    const playerInPlay = [...state.zones.playerInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
                    const opponentInPlay = [...state.zones.opponentInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

                    return {
                        ...state,
                        zones: {
                            ...state.zones,
                            playerInPlay,
                            opponentInPlay,
                        },
                    }                    
                    break;
                }                
                case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
                    const playerInPlay = [...state.zones.playerInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);
                    const opponentInPlay = [...state.zones.opponentInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

                    return {
                        ...state,
                        zones: {
                            ...state.zones,
                            playerInPlay,
                            opponentInPlay,
                        },
                    }
                    break;
                }                
                case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
                    const isOwnMagi = state.zones.playerActiveMagi &&
                        state.zones.playerActiveMagi.length &&
                        state.zones.playerActiveMagi[0].id === action.target.id;
                    const ownerName = isOwnMagi ? 'player' : 'opponent';
                    const zoneId = `${ownerName}ActiveMagi`;

                    return {
                        ...state,
                        zones: {
                            ...state.zones,
                            [zoneId]: [
                                {
                                    ...state.zones[zoneId][0],
                                    data: {
                                        ...state.zones[zoneId][0].data,
                                        energy: (state.zones[zoneId][0].data.energy || 0) + action.amount,
                                    }
                                }
                            ],
                        },
                    }                    
                    break;
                }
                case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
                    const isOwnMagi = state.zones['playerActiveMagi'] &&
                        state.zones['playerActiveMagi'][0] &&
                        state.zones['playerActiveMagi'][0].id === action.target.id;
                    const ownerName = isOwnMagi ? 'player' : 'opponent';
                    const zoneId = `${ownerName}ActiveMagi`;

                    return {
                        ...state,
                        zones: {
                            ...state.zones,
                            [zoneId]: [
                                {
                                    ...state.zones[zoneId][0],
                                    data: {
                                        ...state.zones[zoneId][0].data,
                                        energy: (state.zones[zoneId][0].data.energy || 0) - action.amount,
                                    }
                                }
                            ],
                        },
                    }                    
                    break;
                }
            }
            return state;
        }
        case TYPE_DISPLAY: {
            switch (action.subtype) {
                case SUBTYPE_ZONE_UPDATE:
                    console.log(`Zone update`);
                    const zoneName = zoneNames[action.zoneType];
                    const ownerName = action.player == window.playerId ? 'player' : 'opponent';

                    const zoneId = `${ownerName}${zoneName}`;

                    console.log(`Zone id: ${zoneId}`);

                    return {
                        ...state,
                        zones: {
                            ...state.zones,
                            [zoneId]: action.content,
                        },
                        cardNav: {
                            ...state.cardNav,
                        }
                    }
                    break;
            }
            break;
        }
        default: {
            return state;
        }
    }
    return state;
}