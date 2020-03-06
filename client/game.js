/* global document, window, io */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import App from './components/App';
import rootReducer from './reducers';

function startGame() {
	console.log('Document ready');
	console.dir(document.getElementById('game'));

	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

	const store = createStore(
		rootReducer,
		window.initialState,
		composeEnhancers(
			applyMiddleware(thunk),
		),
	);
	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('game'),
	);
	window.socket = io(`/?gameId=${window.gameId}&playerId=${window.playerId}`);
	window.socket.on('action', function(action) {
		console.dir(action);
		store.dispatch(action);
	});

	window.socket.on('display', function(action) {
		store.dispatch({
			type: 'actions/display',
			...action,
		});
	});
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		startGame();
	}
};
