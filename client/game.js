/* global document, window, io */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { 
	startPowerAnimation,
	endPowerAnimation,
	startAttackAnimation,
	endAttackAnimation,
} from './actions';
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import {Observable, from, timer} from 'rxjs';
import {delayWhen, concatMap} from 'rxjs/operators';
import thunk from 'redux-thunk';

import {
	ACTION_POWER,
	ACTION_ATTACK,
} from 'moonlands/src/const.js';

import App from './components/App.jsx';
import rootReducer from './reducers';

const POWER_MESSAGE_TIMEOUT = 4000;
const ATTACK_MESSAGE_TIMEOUT = 600;

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

	const actionTypesToAnimate = [
		ACTION_POWER,
	];

	const actionsObservable = Observable.create(observer => {
		window.socket = io(`/?gameId=${window.gameId}&playerId=${window.playerId}`);
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

	const delayedActions = actionsObservable
		.pipe(
			concatMap(action =>
				from(actionTypesToAnimate.includes(action.type) && (action.player !== window.playerId) ?
					[
						startPowerAnimation(action.source.id, action.power, action.player), 
						endPowerAnimation(action.power),
						action,
					] :
					[action]
				).pipe(
					delayWhen(({endAnimation = false}) =>
						endAnimation == true ? timer(POWER_MESSAGE_TIMEOUT): timer(0),
					),		
				),
			),
			concatMap(action =>
				from(action.type === ACTION_ATTACK && (action.source.owner !== window.playerId) ?
					[
						startAttackAnimation(action.source.id, action.target.id, action.player), 
						endAttackAnimation(action.source.id),
						action,
					] :
					[action]
				).pipe(
					delayWhen(({endAnimation = false}) =>
						endAnimation == true ? timer(ATTACK_MESSAGE_TIMEOUT): timer(0),
					),		
				),
			),
		);

	delayedActions.subscribe(transformedAction => {
		console.log('Transformed');
		console.dir(transformedAction);
		store.dispatch(transformedAction);
	});
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
