var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
 
      

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
import {sessionGen, basicAuth, authRouter} from './routes/auth';
app.use(sessionGen);
app.use(basicAuth)
app.use(authRouter);


import {indexRouter} from './routes/index';

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
