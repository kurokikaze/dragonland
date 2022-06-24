import express from 'express';
import passport from 'passport';
import ensure from 'connect-ensure-login';

import {getUserByUsername, insertUser, getUserDecks} from '../utils/database.js';
import {getPasswordHash} from '../utils/crypto.js';
import {getChallenges} from '../utils/challenge.js';

const router = express.Router();

/* GET users listing. */
router.get('/login', 
	function(req, res) {
		res.render('login', req.query);
	});

router.post('/login',
	passport.authenticate('local', { failureRedirect: '/users/login?loginError=true', successRedirect: '/' }),
	function(_req, res) {
		res.redirect('/');
	});

router.get('/challenge',
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

router.get('/register', 
	function(req, res) {
		res.render('register');
	});

router.post('/register',
	function(req, res) {
		const {name, username, password, password2, question} = req.body;

		if (
			password === password2 &&
			name !== '' &&
			username !== '' &&
			question.toLowerCase() === 'cald'
		) {
			// register and login
			getUserByUsername(username, user => {
				if (!user) {
					const passwordHash = getPasswordHash(password);
					insertUser(username, name, passwordHash).then(newUser => {
						req.login(newUser, err => {
							if (!err) {
								res.redirect('/');
							} else {
								console.log('Error logging in');
								console.dir(err);
								res.redirect('/users/register');
							}
						});
					});
				} else {
					res.render('error', {
						message: 'Error registering user',
						error: {},
					});
				}
			});
		} else {
			res.redirect('/users/register');
		}
	}
);

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/users/login');
});

export default router;
