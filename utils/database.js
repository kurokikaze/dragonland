import mongodb from 'mongodb';

import config from '../config.js';
import {USER_ID_FIELD} from '../const.js';

const { MongoClient } = mongodb;

var _db;

export function connectToServer(callback) {
	MongoClient.connect( config.databaseUri, { useNewUrlParser: true }, (err, connection) => {
		console.log('database connected');
		_db = connection.db(config.databaseName);
		return callback(err);
	});
}

export function getUserByUsername(username, callback) {
	_db.collection('users').findOne({login: username}, callback);
}

export function getUserByGameId(gameId, callback) {
	_db.collection('users').findOne({[USER_ID_FIELD]: gameId}, callback);
}

export function getDb() {
	return _db;
}
