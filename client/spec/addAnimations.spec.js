/* global describe, it, beforeEach, expect */
import {TestScheduler} from 'rxjs/testing';

import {
	ACTION_POWER, 
	ACTION_RESOLVE_PROMPT,
	ACTION_PASS,
} from 'moonlands/src/const.js';

import { 
	START_POWER_ANIMATION,
	END_POWER_ANIMATION,
	END_PROMPT_RESOLUTION_ANIMATION,
} from '../actions';

import addAnimations from '../addAnimations.js';

describe('Delay on power use', () => {
	let scheduler;

	beforeEach(() => {
		scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
	});

	it('delays power use test', () => {
		scheduler.run(({cold, expectObservable}) => {
			const actions = {
				a: {
					type: ACTION_POWER,
					player: 2,
					source: {
						id: 'Creature',
					},
					power: {
						name: 'Ability',
					}
				},
				b: {
					type: ACTION_PASS,
				}
			};

			const source$ = cold('-(ab)', actions);
			const result$ = addAnimations(source$);
			
			const expectedMarble = '-(ab) 3996ms (cd)';
			const expectedActions = {
				a: {
					type: START_POWER_ANIMATION,
					player: 2,
					source: 'Creature',
					power: {
						name: 'Ability',
					},
				},
				b: {
					type: ACTION_POWER,
					player: 2,
					source: {
						id: 'Creature',
					},
					power: {
						name: 'Ability',
					}
				},
				c: {
					type: END_POWER_ANIMATION,
					endAnimation: true,
					source: {
						name: 'Ability',
					},
				},
				d: {
					type: ACTION_PASS,
				}
			};
			return expectObservable(result$).toBe(expectedMarble, expectedActions);
		});
	});

	it('delays prompt resolve action', () => {
		scheduler.run(({cold, expectObservable}) => {
			const actions = {
				a: {
					type: ACTION_RESOLVE_PROMPT,
					player: 2,
					number: 4,
				},
				b: {
					type: ACTION_PASS,
				}
			};

			const source$ = cold('-(ab)', actions);
			const result$ = addAnimations(source$);
			
			const expectedMarble = '-a 3999ms (bc)';
			const expectedActions = {
				a: {
					type: ACTION_RESOLVE_PROMPT,
					player: 2,
					number: 4,
				},
				b: {
					type: END_PROMPT_RESOLUTION_ANIMATION,
				},
				c: {
					type: ACTION_PASS,
				}
			};
			expectObservable(result$).toBe(expectedMarble, expectedActions);
		});
	});

	it.only('two delays consecutively', () => {
		scheduler.run(({cold, expectObservable}) => {
			const actions = {
				a: {
					type: ACTION_POWER,
					player: 2,
					source: {
						id: 'Creature',
					},
					power: {
						name: 'Ability',
					}
				},
				b: {
					type: ACTION_PASS,
				},
				c: {
					type: ACTION_RESOLVE_PROMPT,
					player: 2,
					number: 4,
				},
				d: {
					type: ACTION_PASS,
				}
			};

			const source$ 	= cold('-(abcd)', actions);
			const expectedMarble = '-(xa) 3996ms (ybc) 3995ms (zd)';
			const result$ = addAnimations(source$);
			
			
			const expectedActions = {
				x: {
					type: START_POWER_ANIMATION,
					player: 2,
					source: 'Creature',
					power: {
						name: 'Ability',
					},
				},
				a: {
					type: ACTION_POWER,
					player: 2,
					source: {
						id: 'Creature',
					},
					power: {
						name: 'Ability',
					}
				},
				y: {
					type: END_POWER_ANIMATION,
					endAnimation: true,
					source: {
						name: 'Ability',
					},
				},
				b: {
					type: ACTION_PASS,
				},
				z: {
					type: END_PROMPT_RESOLUTION_ANIMATION,
				},
				c: {
					type: ACTION_RESOLVE_PROMPT,
					player: 2,
					number: 4,
				},
				d: {
					type: ACTION_PASS,
				}
			};
			expectObservable(result$).toBe(expectedMarble, expectedActions);
		});
	});

});