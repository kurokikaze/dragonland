/* global document, window, io */
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { Observable } from 'rxjs';
import thunk from 'redux-thunk';

import App from './components/App.jsx';
import rootReducer from './reducers';
import rootEpic from './epics';
import addAnimations from './addAnimations.js';
import { enrichState } from './utils.js';

function startGame() {
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const epicMiddleware = createEpicMiddleware();

	const store = createStore(
		rootReducer,
		enrichState(window.initialState),
		composeEnhancers(
			applyMiddleware(thunk),
			applyMiddleware(epicMiddleware),
		),
	);

	epicMiddleware.run(rootEpic);

	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('game'),
	);

	const actionsObservable = Observable.create(observer => {
		window.socket = io(`/?playerHash=${window.playerHash}`);
		window.socket.on('action', function(action) {
			// console.dir(action);
			observer.next(action);
		});

		window.socket.on('display', function(action) {
			const displayAction = {
				type: 'actions/display',
				...action,
			};

			observer.next(displayAction);
		});

		window.socket.on('error', error => observer.error(error));
	});

	const delayedActions = addAnimations(actionsObservable);

	delayedActions.subscribe(transformedAction => store.dispatch(transformedAction));

	window.dispatch = event => store.dispatch(event);
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
