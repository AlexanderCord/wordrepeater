// OAuth Authorization
import { sessionGen, basicAuth, authRouter } from "./controllers/auth";

import IController from "./controllers/icontroller";

import express from "express";
import bodyParser from "body-parser";

class App {
  public app: express.Application;
  public port: number;
  private debug: any;
  private http: any;
  private server: any;

  constructor(controllers: IController[], port: number) {
    this.app = express();
    this.port = port;
    this.http = require("http");
    this.debug = require("debug")("node-express-swig-mongo:server");

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandlers()
  }

  private initializeMiddlewares() {
    var express = require("express");
    var path = require("path");
    var cookieParser = require("cookie-parser");
    var logger = require("morgan");

    // authorization
    var config: any = require("./config");

    // view engine setup

    this.app.set("views", path.join(__dirname, "views"));

    var methodOverride = require("method-override");
    this.app.use(methodOverride("_method"));

    var swig = require("swig");
    var swig = new swig.Swig({ cache: false });
    this.app.engine("html", swig.renderFile);
    this.app.set("view engine", "html");
    //app.set('view engine', 'jade');

    this.app.use(logger("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, "/../public")));

    this.app.use(sessionGen);
    this.app.use(basicAuth);
    this.app.use(authRouter);

  }

  private initializeControllers(controllers: IController[]) {
    controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
  }
  
  private initializeErrorHandlers() {
    var createError = require("http-errors");

    // catch 404 and forward to error handler
    this.app.use(function(req: any, res: any, next: any) {
      next(createError(404));
    });

    // error handler
    this.app.use(function(err: any, req: any, res: any, next: any) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render("error");
    });

  }
  

  /**
   * Event listener for HTTP server "error" event.
   */

  private onError(error: any) {
    if (error.syscall !== "listen") {
      throw error;
    }

    let bind = "Port " + this.port; 

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }


  public listen() {
    this.server = this.http.createServer(this.app);

    this.server.listen(this.port);
    this.server.on("error", this.onError);
    this.server.on("listening", () => {
      console.log("Listening on " + this.port)
    });

    /*this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });*/
  }
}

export default App;

