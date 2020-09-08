import createError from 'http-errors';
import express from 'express';
// import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';
import usersRouter from './routes/users.js';

var app = express();

// view engine setup
// eslint-disable-next-line
const dirname__ = path.dirname(import.meta.url.substring(8));
app.set('views', path.join(dirname__, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(dirname__, 'public')));

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

export default app;
