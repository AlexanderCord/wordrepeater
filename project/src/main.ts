// OAuth Authorization
import {sessionGen, basicAuth, authRouter} from './routes/auth';

import indexController from './controllers/index';
import IController from './controllers/icontroller';




import express from 'express';
import bodyParser from 'body-parser';
 
class App {
  public app: express.Application;
  public port: number;
 
  constructor(controllers: IController[], port: number) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
  
  
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
 
      






// authorization
var config: any = require('./config'); 

// view engine setup

this.app.set('views', path.join(__dirname, 'views'));


var methodOverride = require('method-override');
this.app.use(methodOverride('_method'))
 

var swig = require('swig');
var swig = new swig.Swig({cache: false});
this.app.engine('html', swig.renderFile);
this.app.set('view engine', 'html');
//app.set('view engine', 'jade');
  
this.app.use(logger('dev'));
this.app.use(express.json());
this.app.use(express.urlencoded({ extended: false }));
this.app.use(cookieParser());
this.app.use(express.static(path.join(__dirname, '/../public'))); 


this.app.use(sessionGen);
this.app.use(basicAuth)
this.app.use(authRouter);


// new routes as controller


// mongoose config
require('./models/database');
  
// Vocabulary UI
var wordsRouter = require('./routes/words');
this.app.use('/vocabulary', wordsRouter); 

// Training UI
var trainRouter = require('./routes/train');
this.app.use('/train', trainRouter); 

     
  
// catch 404 and forward to error handler
this.app.use(function(req: any, res: any, next: any) {
  next(createError(404));
});
  
// error handler
this.app.use(function(err: any, req: any, res:any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
    
    
    
    
    
  }
 
  private initializeControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
 
export default App;

