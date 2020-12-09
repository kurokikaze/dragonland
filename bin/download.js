import fs from 'fs';
import fetch from 'node-fetch';

import config from '../config.js';
import {cards} from 'moonlands/src/cards.js';
import {camelCase} from '../client/utils.js';

// Fire ball is named inconsistently with other cards,
// it's fixed in Moonlands, but we still have to download file by old URL

const ALL_SETS_FIELD_NAME = 'plugins/magination2/sets/allsets.txt';
const CORRECTIONS = {
	'Fire Ball': 'Fire ball',
};

function tsvToObjects(tsvData) {
	const fields = tsvData.shift();
	console.dir(fields);
	let data = [];

	for (let entry of tsvData) {
		let processedEntry = {};
		for (let fieldNum in fields) {
			let field = fields[fieldNum];
			processedEntry[field] = entry[fieldNum];
		}
		data.push(processedEntry);
	}

	return data;
}

async function getAllSetsEntry(pluginUrl) {
	const request = await fetch(pluginUrl);

	const data = await request.text();
	const allSetsEntry = data.split('\n').map(entry => entry.split('\t')).filter(entry => entry[0] === ALL_SETS_FIELD_NAME)[0];
	return allSetsEntry;
}

async function getCardDataRaw(entrypoint) {
	const request = await fetch(entrypoint);

	const data = await request.text();
	return data.split('\n').map(entry => entry.split('\t'));
}

function getFileNames(cardData) {
	let hash = {};
	cardData.forEach(entry => {
		hash[entry.Name] = entry.ImageFile;
	});

	return hash;
}

function filenameToUrl(filename) {
	return `https://lackeyccg.com/magination/medium/${filename}.jpg`;
}

async function main() {
	const allSetsEntry = await getAllSetsEntry(config.magiNationPlugin);

	const cardDataRaw = await getCardDataRaw(allSetsEntry[1]);
	const cardData = tsvToObjects(cardDataRaw);

	const fileNameHash = getFileNames(cardData);

	cards.forEach(async card => {
		const cardName = CORRECTIONS[card.name] ? CORRECTIONS[card.name] : card.name; 
		if (fileNameHash[cardName]) {
			const url = fileNameHash[cardName];
			console.log('Downloaded', cardName, url);
			const request = await fetch(filenameToUrl(url));

			const data = await request.buffer();
			fs.writeFileSync('./public/images/cards/' + camelCase(card.name) + '.jpg', data, {flag: 'w'});
		} else {
			console.warn('Couldnt download', cardName);
		}
	});
}

main();
