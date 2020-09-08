export const SHOW_POWER_NAME = 'actions/show_power_name';
export const HIDE_POWER_NAME = 'actions/hide_power_name';
export const START_POWER_ANIMATION = 'actions/start_power_animation';
export const END_POWER_ANIMATION = 'actions/end_power_animation';
export const START_ATTACK_ANIMATION = 'actions/start_attack_animation';
export const END_ATTACK_ANIMATION = 'actions/end_attack_animation';

export const showPowerName = (id, powerName) => ({type: SHOW_POWER_NAME, id, powerName});
export const hidePowerName = (id, powerName) => ({type: HIDE_POWER_NAME, id, powerName});
export const startPowerAnimation = (source, power, player) => ({type: START_POWER_ANIMATION, source, power, player});
export const endPowerAnimation = (source) => ({type: END_POWER_ANIMATION, source, endAnimation: true});
export const startAttackAnimation = (source, target, player) => ({type: START_ATTACK_ANIMATION, source, target, player});
export const endAttackAnimation = (source) => ({type: END_ATTACK_ANIMATION, source, endAnimation: true});
