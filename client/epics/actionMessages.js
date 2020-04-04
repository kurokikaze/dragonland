import {of, timer} from 'rxjs';
import {concatMap, delayWhen} from 'rxjs/operators';
import {
	TYPE_POWER,
} from 'moonlands/src/const';

import {
	showPowerName,
	hidePowerName,
	HIDE_POWER_NAME,
} from '../actions';

const actionMessagesEpic = action$ => action$
	.filter(({type}) => type === TYPE_POWER)
	.pipe(
		concatMap(x =>
			of(
				showPowerName(x.source.id, x.power.name),
				hidePowerName(x.source.id, x.power.name)
			).pipe(
				delayWhen(({type}) =>
					type === HIDE_POWER_NAME ? timer(1000): timer(0),
				),		
			),
		),
	);

export default actionMessagesEpic;

