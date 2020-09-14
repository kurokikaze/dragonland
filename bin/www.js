#!/usr/bin/env node

/**
 * Module dependencies.
 */
import initApp from '../app.js';
import debug from 'debug';
import http from 'http';
import io from 'socket.io';

const serverDebug = debug('dragonland:server');

/**
 * Create HTTP server.
 */
initApp(app => {
	const port = normalizePort(process.env.PORT || '3000');
	app.set('port', port);

	const onListening = () => {
		var addr = server.address();
		var bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port;

		serverDebug('Listening on ' + bind);
	};

	const server = http.createServer(app);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	const ioServer = io.listen(server);
	app.set('io', ioServer);
});

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error('Binding requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error('Port is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

