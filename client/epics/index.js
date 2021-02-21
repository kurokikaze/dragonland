import {combineEpics} from 'redux-observable';
import {catchError} from 'rxjs/operators';

import turnTimerEpic from './turnTimerEpic';

const rootEpic = (action$, store$, dependencies) =>
	combineEpics(
		turnTimerEpic,
	)(action$, store$, dependencies).pipe(
		catchError((error, source) => {
			console.log('Epic error');
			console.error(error);
			return source;
		})
	);

export default rootEpic;