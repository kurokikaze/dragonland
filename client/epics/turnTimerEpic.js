import { interval } from 'rxjs';
import { filter, takeUntil, switchMap, mapTo } from 'rxjs/operators';

import { ACTION_TIME_NOTIFICATION, ACTION_EFFECT, EFFECT_TYPE_END_OF_TURN } from 'moonlands/dist/const';
import { ACTION_TIMER_TICK } from '../const';

const turnTimerEpic = action$ => action$.pipe(
	filter(a => a.type === ACTION_TIME_NOTIFICATION),
	switchMap(() =>
		interval(1000).pipe(
			takeUntil(action$.pipe(
				filter(a => a.type === ACTION_EFFECT && a.effectType  === EFFECT_TYPE_END_OF_TURN)),
			),
			mapTo({ type: ACTION_TIMER_TICK }),
		),
	),
);

export default turnTimerEpic;
