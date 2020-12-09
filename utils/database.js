import mongodb from 'mongodb';

import config from '../config.js';
import {USER_ID_FIELD, CALD_DECK, NAROOM_DECK, ARDERIAL_DECK, OROTHE_DECK} from '../const.js';

const { MongoClient, ObjectID } = mongodb;

const USERS_COLLECTION = 'users';
const DECKS_COLLECTION = 'decks';
const COUNTERS_COLLECTION = 'counters';

var _db;
var close = () => {};

export function setupDatabase() {
	connectToServer(() => {
		_db.collection(COUNTERS_COLLECTION).insertMany([
			{
				_id: USERS_COLLECTION,
				sequenceValue: 1,
			},
			{
				_id: DECKS_COLLECTION,
				sequenceValue: 1,
			},
		]);
	});
}

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
	const collection = _db.collection(DECKS_COLLECTION);

	const query = {playerId};
	const options = {};
	const cursor = collection.find(query, options);

	const decks = [];

	await cursor.forEach(deck => decks.push(deck));

	return decks;
}

export async function getDeckById(deckId) {
	const deckObject = await _db.collection(DECKS_COLLECTION).findOne({_id: new ObjectID(deckId)});

	return deckObject;
}

export function getUserByUsername(username, callback) {
	_db.collection(USERS_COLLECTION).findOne({login: username}, callback);
}

export function getUserByGameId(gameId, callback) {
	_db.collection(USERS_COLLECTION).findOne({[USER_ID_FIELD]: gameId}, callback);
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
	var sequenceDocument = await _db.collection(COUNTERS_COLLECTION).findOneAndUpdate(filter, update);
	console.log('Sequence number is', sequenceDocument.value.sequenceValue);
	return sequenceDocument.value.sequenceValue;
}

export async function insertUser(username, name, passwordHash) {
	const nextGameId = await getNextSequenceValue(USERS_COLLECTION);
	const newUser = await _db.collection(USERS_COLLECTION).insertOne({
		gameId: nextGameId,
		login: username,
		name,
		password: passwordHash,
	});
	_db.collection(DECKS_COLLECTION).insertMany([
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