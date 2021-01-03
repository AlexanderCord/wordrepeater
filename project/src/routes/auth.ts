var express = require('express');
var authRouter = express.Router();

import { sessionGen, basicAuth, loginAction, callbackAction, logoutAction } from '../controllers/auth';


authRouter.get('/login', loginAction);
authRouter.get('/logout', logoutAction);
authRouter.get('/auth/google/callback', callbackAction);


export {
    sessionGen,
    basicAuth,
    authRouter
}
