import express from 'express';
import {cards} from 'moonlands/src/cards.js';
import {camelCase} from '../client/utils.js';
import ensure from 'connect-ensure-login';

import {getUserDecks} from '../utils/database.js';
import {getChallenges} from '../utils/challenge.js';

const router = express.Router();

/* GET home page. */
router.get('/',
	ensure.ensureLoggedIn('/users/login'),
	async function(req, res) {
		const decks = await getUserDecks(req.user.gameId);

		res.render('challenge', {
			title: 'Dragonlands',
			playerId: req.user.gameId || null,
			username: req.user.name,
			initialState: {
				username: req.user.name,
				decks,
				currentDeck: decks[0]._id,
				challenges: getChallenges(),
			},
		});
	}
);

router.get('/coverage', function(req, res) {
	res.render('implementation', { 
		title: 'Implemented cards',
		cards: cards.map(card => ({ name: camelCase(card.name), implemented: true })),
	});
});

export default router;
