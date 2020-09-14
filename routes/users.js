import express from 'express';
import passport from 'passport';

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

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/users/login');
});

export default router;
