/* global document, window, io */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import {Observable, from, timer} from 'rxjs';
import {delayWhen, concatMap, filter} from 'rxjs/operators';
import thunk from 'redux-thunk';

import {ACTION_POWER} from 'moonlands/src/const';

import App from './components/App';
import rootReducer from './reducers';

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

	// epicMiddleware.run(rootEpic);

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
			// store.dispatch(action);

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
				from(actionTypesToAnimate.includes(action.type) ?
					[
						{
							type: 'start_power_animation',
							source: action.source.id,
							power: action.power,
							player: action.player,
						}, {
							type: 'end_power_animation',
							endAnimation: true,
						},
						action,
					] :
					[action]
				).pipe(
					delayWhen(({endAnimation = false}) =>
						endAnimation == true ? timer(1000): timer(0),
					),		
				),
			),
		);

	// actionsObservable.subscribe(action => store.dispatch(action));

	delayedActions.subscribe(transformedAction => {
		console.dir(transformedAction);
		store.dispatch(transformedAction);
	});
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
