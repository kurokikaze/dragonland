import express from 'express';
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

export default router;
