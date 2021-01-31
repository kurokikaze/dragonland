/* global document, window */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import App from './App.jsx';
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
			<App />
		</Provider>
		,
		document.getElementById('game'),
	);
}

document.onreadystatechange = function() {
	if (document.readyState == 'complete') {
		start();
	}
};
