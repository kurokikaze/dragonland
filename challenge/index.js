/* global document, window */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import {fetchChallenges} from './actions/index.js';
import App from './components/ChallengeApp.jsx';
import rootReducer from './reducers/reducer.js';

function start() {
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
	setInterval(() => {
		store.dispatch(fetchChallenges());
	}, 5000);
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		start();
	}
};
