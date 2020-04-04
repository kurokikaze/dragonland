import {combineEpics} from 'redux-observable';
import {catchError} from 'rxjs/operators';

import actionMessages from './actionMessages';

const rootEpic = (action$, store$, dependencies) =>
	combineEpics(
		actionMessages,
	)(action$, store$, dependencies).pipe(
		catchError((error, source) => {
			console.error(error);
			return source;
		})
	);

export default rootEpic;