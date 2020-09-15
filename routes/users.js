import express from 'express';
import passport from 'passport';

import {getUserByUsername, insertUser} from '../utils/database.js';
import {getPasswordHash} from '../utils/crypto.js';

const router = express.Router();

/* GET users listing. */
router.get('/login', 
	function(req, res) {
		res.render('login');
	});

router.post('/login',
	passport.authenticate('local', { failureRedirect: '/users/login', successRedirect: '/' }),
	function(req, res) {
		res.redirect('/');
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
