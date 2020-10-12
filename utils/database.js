import mongodb from 'mongodb';

import config from '../config.js';
import {USER_ID_FIELD, CALD_DECK, NAROOM_DECK, ARDERIAL_DECK, OROTHE_DECK} from '../const.js';

const { MongoClient, ObjectID } = mongodb;

var _db;
var close = () => {};

export function connectToServer(callback) {
	MongoClient.connect( config.databaseUri, { useNewUrlParser: true }, (err, connection) => {
		if (err) {
			console.dir(err);
			process.exit(1);
		}
		console.log('database connected');
		_db = connection.db(config.databaseName);
		close = () => connection.close();

		return callback(err);
	});
}

export async function getUserDecks(playerId) {
	const collection = _db.collection('decks');

	const query = {playerId};
	const options = {};
	const cursor = collection.find(query, options);

	const decks = [];

	await cursor.forEach(deck => decks.push(deck));

	return decks;
}

export async function getDeckById(deckId) {
	const deckObject = await _db.collection('decks').findOne({_id: new ObjectID(deckId)});

	return deckObject;
}

export function getUserByUsername(username, callback) {
	_db.collection('users').findOne({login: username}, callback);
}

export function getUserByGameId(gameId, callback) {
	_db.collection('users').findOne({[USER_ID_FIELD]: gameId}, callback);
}

async function getNextSequenceValue(sequenceName) {
	console.log('getting new sequence number');
	const filter = {
		_id: sequenceName,
	};
	const update = {
		$inc: {
			sequenceValue: 1,
		},
	};
	var sequenceDocument = await _db.collection('counters').findOneAndUpdate(filter, update);
	console.log('Sequence number is', sequenceDocument.value.sequenceValue);
	return sequenceDocument.value.sequenceValue;
}

export async function insertUser(username, name, passwordHash) {
	const nextGameId = await getNextSequenceValue('users');
	const newUser = await _db.collection('users').insertOne({
		gameId: nextGameId,
		login: username,
		name,
		password: passwordHash,
	});
	_db.collection('decks').insertMany([
		{
			...CALD_DECK,
			name: `${name}'s Cald Deck`,
			playerId: nextGameId,
		},
		{
			...NAROOM_DECK,
			name: `${name}'s Naroom Deck`,
			playerId: nextGameId,
		},
		{
			...ARDERIAL_DECK,
			name: `${name}'s Arderial Deck`,
			playerId: nextGameId,
		},
		{
			...OROTHE_DECK,
			name: `${name}'s Orothe Deck`,
			playerId: nextGameId,
		}
	]);

	return newUser.ops[0];
}

export function getDb() {
	return _db;
}

export function getClose() {
	return close;
}