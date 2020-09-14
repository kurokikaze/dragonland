/* global document, window */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
// import {Observable} from 'rxjs';
import thunk from 'redux-thunk';

import App from './components/ChallengeApp.jsx';
// import rootReducer from './reducers';

function startGame() {
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const epicMiddleware = createEpicMiddleware();

	const store = createStore(
		rootReducer,
		window.initialState,
		composeEnhancers(
			applyMiddleware(thunk),
			applyMiddleware(epicMiddleware),
		),
	);

	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('game'),
	);

	/* const actionsObservable = Observable.create(observer => {
		window.socket = io(`/?playerHash=${window.playerHash}`);
		window.socket.on('action', function(action) {
			console.log('Action type: ', action.type);
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

	delayedActions.subscribe(transformedAction => {
		console.log('Transformed');
		console.dir(transformedAction);
		store.dispatch(transformedAction);
	}); */
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
