/* global window */
import {from, timer, merge, zip} from 'rxjs';
import {delayWhen, concatMap, share, filter, map} from 'rxjs/operators';

import {
	ACTION_POWER,
	ACTION_ATTACK,
	ACTION_EFFECT,
	EFFECT_TYPE_START_STEP,
	EFFECT_TYPE_PLAY_RELIC,
	EFFECT_TYPE_PLAY_SPELL,
	ACTION_ENTER_PROMPT,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/src/const.js';

import { 
	startPowerAnimation,
	endPowerAnimation,
	startAttackAnimation,
	endAttackAnimation,
	startRelicAnimation,
	endRelicAnimation,
	startSpellAnimation,
	endSpellAnimation,
	endStepAnimation,
	startPromptResolutionAnimation,
	endPromptResolutionAnimation,
	END_POWER_ANIMATION,
	END_RELIC_ANIMATION,
	END_SPELL_ANIMATION,
	END_ATTACK_ANIMATION,
	// START_PROMPT_RESOLUTION_ANIMATION,
	END_PROMPT_RESOLUTION_ANIMATION,
	END_STEP_ANIMATION,
} from './actions';

const POWER_MESSAGE_TIMEOUT = 10000;
const RELIC_MESSAGE_TIMEOUT = 3000;
const ATTACK_MESSAGE_TIMEOUT = 600;
const PROMPT_RESOLUTION_TIMEOUT = 600;
const STEP_TIMEOUT = 500;

const convertAction = action => {
	switch(action.type) {
		case ACTION_RESOLVE_PROMPT:
			return  (action.player !== window.playerId) ? [
				startPromptResolutionAnimation(action.target ? action.target._card.name : action.number),
				endPromptResolutionAnimation(),
				action,
			] : [action];
		case ACTION_POWER:
			return (action.source.owner !== window.playerId) ? [
				startPowerAnimation(action.source.id, action.power, action.player), 
				endPowerAnimation(action.power),
				action,
			] : [action];
		case ACTION_ATTACK: {
			return (action.source.owner !== window.playerId) ? [
				startAttackAnimation(action.source.id, action.target.id, action.player), 
				endAttackAnimation(action.source.id),
				action,
			] : [action];
		}
		case ACTION_EFFECT: {
			switch(action.effectType) {
				case EFFECT_TYPE_PLAY_RELIC:
					return (action.player !== window.playerId) ? [
						startRelicAnimation(action.card, action.player), 
						endRelicAnimation(),
						action,
					] : [action];
				case EFFECT_TYPE_PLAY_SPELL:
					return (action.player !== window.playerId) ? [
						startSpellAnimation(action.card, action.player), 
						endSpellAnimation(),
						action,
					] : [action];
				case EFFECT_TYPE_START_STEP:
					return [
						endStepAnimation(),
						action,
					];
			}
			return [action];
		}
		default:
			return [action];
	}
};

const TIMERS_BY_EVENT = {
	[END_PROMPT_RESOLUTION_ANIMATION]: PROMPT_RESOLUTION_TIMEOUT,
	[END_POWER_ANIMATION]: POWER_MESSAGE_TIMEOUT,
	[END_RELIC_ANIMATION]: RELIC_MESSAGE_TIMEOUT,
	[END_SPELL_ANIMATION]: POWER_MESSAGE_TIMEOUT,
	[END_ATTACK_ANIMATION]: ATTACK_MESSAGE_TIMEOUT,
	[END_STEP_ANIMATION]: STEP_TIMEOUT,
};

const convertTimer = type => {
	return timer(TIMERS_BY_EVENT[type] || 0);
};

export default function addAnimations (action$) {
	const actionDelayed$ = action$.pipe(
		concatMap(action =>
			from(convertAction(action)).pipe(
				delayWhen(({type}) => convertTimer(type)),
			),
		),
		share()
	);

	const response$ = action$.pipe(
		filter(({type}) => type == ACTION_RESOLVE_PROMPT),
	);

	const promptDelayed$ = actionDelayed$.pipe(
		filter(({type}) => type == ACTION_ENTER_PROMPT),
	);
  
	const responseN1AfterPromptN$ = zip(response$, promptDelayed$).pipe(
		map(([r]) => r),
	);

	const actionNoResponseDelayed$ = actionDelayed$.pipe(
		filter(({type}) => type != ACTION_RESOLVE_PROMPT),
	);

	return merge(actionNoResponseDelayed$, responseN1AfterPromptN$);
}
