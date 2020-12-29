var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
 
      
import {indexRouter} from './routes/index';

var app = express();

const {google} = require('googleapis');

const { OAuth2Client } = require("google-auth-library");



var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// authorization
var config: any = require('./config'); 
//console.log(basicUsers);



// view engine setup

app.set('views', path.join(__dirname, 'views'));


var methodOverride = require('method-override');
app.use(methodOverride('_method'))
 

var swig = require('swig');
var swig = new swig.Swig({cache: false});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'jade');
  
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../public'))); 


// OAuth Authorization
// @todo refactor into module, probably use some external library to save auth session
//============================================

const oauth2Client = new OAuth2Client(
    config.auth.client_id,
    config.auth.client_secret,
    config.auth.host + '/auth/google/callback'
);

const redirectUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope:'https://www.googleapis.com/auth/userinfo.email',
});


let auth = false; 

async function basicAuth(req: any, res: any, next: any) {
    if(req.path == "/login" || req.path == "/auth/google/callback") {
	return next();
    }
    // header authentification via header for testing
    // @todo rewrite
    console.log(req.headers)
    if(!auth && !(req.header('Auth') == config.auth.client_secret)) {
	console.log('Not authorized');
	return res.redirect('/login');
    }
    
    next();
}
app.use(basicAuth)
app.get('/login', async function (req: any, res:any) {
    if (auth) {
        var oauth2 = google.oauth2({
	  auth: oauth2Client,
	  version: 'v2'
	});
	let userinfo = await oauth2.userinfo.get();
	let userEmail = userinfo.data.email;

        res.render('login', {buttonSpan: 'Sign out', url: '/logout', userInfo: userEmail})
    } else {
        res.render('login', {buttonSpan: 'Sign in', url: redirectUrl, userInfo: ""})
    }
});

app.get('/auth/google/callback', async function (req: any, res:any) {
    const code = req.query.code;
    console.log(`Code is ${code}`);
    if (code) {
        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        auth = true;
    }
    res.redirect('/');
});

app.get('/logout', (req: any, res: any) => {
    oauth2Client.revokeCredentials();
    auth = false;
    res.redirect('/login');
});

//============================================


app.use('/', indexRouter);

// mongoose config
require('./models/database');
  
// Vocabulary UI
var wordsRouter = require('./routes/words');
app.use('/vocabulary', wordsRouter); 

// Training UI
var trainRouter = require('./routes/train');
app.use('/train', trainRouter); 

     
  
// catch 404 and forward to error handler
app.use(function(req: any, res: any, next: any) {
  next(createError(404));
});
  
// error handler
app.use(function(err: any, req: any, res:any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
