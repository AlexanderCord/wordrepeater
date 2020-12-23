import express, { Express } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser';
import  createError from 'http-errors';
import  path from 'path';
import  cookieParser from 'cookie-parser';
import logger from 'morgan';
import { NextFunction, Request, Response } from 'express';

 
      
import indexRouter from './routes/index';


/*
// authorization
const basicAuth = require('express-basic-auth')
var config = require('./config'); 
basicUsers = config.basic.users;
//console.log(basicUsers);
app.use(basicAuth({
  users: basicUsers, 
  unauthorizedResponse: getUnauthorizedResponse,
  challenge: true, 
}));

function getUnauthorizedResponse(req) {
  return req.auth
    ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
    : 'No credentials provided'
}
*/

// import todoRoutes from './routes'

const app: Express = express()

/*
const PORT: string | number = process.env.PORT || 4000

app.use(bodyParser.json())
app.use(cors())
//app.use(todoRoutes)

const uri: string = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost/${process.env.MONGO_DB}?retryWrites=true&authSource=admin`
console.log(uri);
const options = { useNewUrlParser: true, }
mongoose.set('useFindAndModify', false)
*/

////////////

app.set('views', path.join(__dirname, 'views'));


import methodOverride from 'method-override';
app.use(methodOverride('_method'))
 

import swig from 'swig';
const swigEngine = new swig.Swig({cache: false});
app.engine('html', swigEngine.renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'jade');
  
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 

app.use('/', indexRouter);

// mongoose config
//require('./models/database');
  
  
// catch 404 and forward to error handler
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});
  
// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;





/*
mongoose
    .connect(uri, options)
    .then(() =>
        app.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        )
    )
    .catch((error) => {
        throw error
    })
*/



// view engine setup

