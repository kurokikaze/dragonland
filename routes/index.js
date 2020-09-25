import express from 'express';
import {cards} from 'moonlands/src/cards.js';
import {camelCase} from '../client/utils.js';
import ensure from 'connect-ensure-login';

import {getUserDecks} from '../utils/database.js';

const router = express.Router();

const deckHeight = 18;

/* GET home page. */
router.get('/',
	ensure.ensureLoggedIn('/users/login'),
	async function(req, res) {
		try {
			const decks = await getUserDecks(req.user.gameId);
			
			res.render('index', {
				title: 'Dragonlands',
				decksOne: decks,
				decksTwo: decks,
				deckHeight,
				username: req.user.name,
			});
		} catch(e) {
			res.render('game-error', { 
				message: 'Database error',
				subtext: 'Failed to connect to MongoDB',
			});
		}
	}
);

router.get('/coverage', function(req, res) {
	res.render('implementation', { 
		title: 'Implemented cards',
		cards: cards.map(card => ({ name: camelCase(card.name), implemented: true })),
	});
});

export default router;
