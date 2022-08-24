export const SHOW_POWER_NAME = 'actions/show_power_name';
export const HIDE_POWER_NAME = 'actions/hide_power_name';
export const START_POWER_ANIMATION = 'actions/start_power_animation';
export const END_POWER_ANIMATION = 'actions/end_power_animation';
export const START_ATTACK_ANIMATION = 'actions/start_attack_animation';
export const END_ATTACK_ANIMATION = 'actions/end_attack_animation';
export const START_RELIC_ANIMATION = 'actions/start_relic_animation';
export const END_RELIC_ANIMATION = 'actions/end_relic_animation';
export const START_SPELL_ANIMATION = 'actions/start_spell_animation';
export const END_SPELL_ANIMATION = 'actions/end_spell_animation';
export const START_PROMPT_RESOLUTION_ANIMATION = 'actions/start_prompt_resolution_animation';
export const END_PROMPT_RESOLUTION_ANIMATION = 'actions/end_prompt_resolution_animation';
export const END_STEP_ANIMATION = 'actions/end_step_animation';
export const END_ANIMATION = 'actions/end_animation';

export const ADD_TO_PACK = 'actions/add_to_pack';
export const DISMISS_PACK = 'actions/dismiss_pack';

export const MINUS_ENERGY_ON_CREATURE = 'actions/minus_energy_on_creature';
export const PLUS_ENERGY_ON_CREATURE = 'actions/plus_energy_on_creature';

export const showPowerName = (id, powerName) => ({type: SHOW_POWER_NAME, id, powerName});
export const hidePowerName = (id, powerName) => ({type: HIDE_POWER_NAME, id, powerName});
export const startPowerAnimation = (source, power, player) => ({type: START_POWER_ANIMATION, source, power, player});
export const endPowerAnimation = (source) => ({type: END_POWER_ANIMATION, source, endAnimation: true});
export const startAttackAnimation = (source, target, additionalAttacker, player) => ({type: START_ATTACK_ANIMATION, source, target, additionalAttacker, player});
export const endAttackAnimation = (source) => ({type: END_ATTACK_ANIMATION, source, endAnimation: true});
export const startRelicAnimation = (card) => ({type: START_RELIC_ANIMATION, card, endAnimation: true});
export const endRelicAnimation = () => ({type: END_RELIC_ANIMATION, endAnimation: true});
export const startSpellAnimation = (card) => ({type: START_SPELL_ANIMATION, card, endAnimation: true});
export const endSpellAnimation = () => ({type: END_SPELL_ANIMATION, endAnimation: true});
export const startPromptResolutionAnimation = (target) => ({type: START_PROMPT_RESOLUTION_ANIMATION, target});
export const endPromptResolutionAnimation = () => ({type: END_PROMPT_RESOLUTION_ANIMATION});
export const endStepAnimation = () => ({type: END_STEP_ANIMATION});
export const endAnimation = () => ({type: END_ANIMATION, endAnimation: true});

export const addToPack = (leader, hunter) => ({ type: ADD_TO_PACK, leader, hunter });
export const dismissPack = (leader) => ({ type: DISMISS_PACK, leader });

export const plusEnergy = (cardId) => ({ type: PLUS_ENERGY_ON_CREATURE, cardId });
export const minusEnergy = (cardId) => ({ type: MINUS_ENERGY_ON_CREATURE, cardId });
