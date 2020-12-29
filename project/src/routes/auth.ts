var express = require('express');
var authRouter = express.Router();

const {basicAuth,
      loginAction,
      callbackAction,
      logoutAction} = require('../controllers/auth');


authRouter.get('/login', loginAction);
authRouter.get('/logout', logoutAction);
authRouter.get('/auth/google/callback', callbackAction);


export {
    basicAuth,
    authRouter
}
