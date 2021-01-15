/* global document, window, io */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import {Observable} from 'rxjs';
import thunk from 'redux-thunk';

import App from './components/App.jsx';
import rootReducer from './reducers';
import addAnimations from './addAnimations.js';
import {enrichState} from './utils.js';

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

	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('game'),
	);

	const actionsObservable = Observable.create(observer => {
		window.socket = io(`/?playerHash=${window.playerHash}`);
		window.socket.on('action', function(action) {
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
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
