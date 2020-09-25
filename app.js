import createError from 'http-errors';
import express from 'express';
import session from 'express-session'; 
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import passport from 'passport';
import Strategy from 'passport-local';

import {connectToServer, getUserByUsername, getUserByGameId} from './utils/database.js';
import {getPasswordHash} from './utils/crypto.js';
import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';
import usersRouter from './routes/users.js';
import config from './config.js';
import {USER_ID_FIELD} from './const.js';

const initApp = (mainCallback) => {
	connectToServer(err => {
		var app = express();

		if (err) {
			console.log('Error connecting to DB');
			process.exit(1);
		}

		passport.use(new Strategy(
			function(username, password, cb) {
				getUserByUsername(username, function(err, user) {
					if (err) { return cb(err); }
					if (!user) { return cb(null, false); }
					const hashedPassword = getPasswordHash(password);
					if (user.password != hashedPassword) { return cb(null, false); }
					return cb(null, user);
				});
			}));

		passport.serializeUser(function(user, cb) {
			cb(null, user[USER_ID_FIELD]);
		});

		passport.deserializeUser(function(id, cb) {
			getUserByGameId(id, function (err, user) {
				if (err) { return cb(err); }
				cb(null, user);
			});
		});

		// view engine setup
		const dirname__ = path.dirname('./');
		app.set('views', path.join(dirname__, 'views'));
		app.set('view engine', 'pug');
		
		app.use(logger('combined'));
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(cookieParser());
		app.use(express.static(path.join(dirname__, 'public')));
		app.use(session({ secret: config.expressSecret }));
		app.use(passport.initialize());
		app.use(passport.session());
		
		app.use('/', indexRouter);
		app.use('/api', apiRouter);
		app.use('/users', usersRouter);
		
		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			next(createError(404));
		});
		
		// error handler
		app.use(function(err, req, res) {
			// set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};
		
			// render the error page
			res.status(err.status || 500);
			res.render('error');
		});

		mainCallback(app);
	});
};

export default initApp;
