const {google} = require('googleapis');

const { OAuth2Client } = require("google-auth-library");




var config: any = require('../config'); 
//console.log(basicUsers);



// OAuth Authorization
// @todo use some external library to save auth session
//============================================

import session from 'express-session';


declare module 'express-session' {
  export interface SessionData {
    userEmail: String; //: { [key: string]: any };
    auth: Boolean;
  }
}

import { v4 as uuidv4 } from 'uuid';


const FileStore = require('session-file-store')(session);
let fileStoreOptions = {};
const sessionGen = 
 session({
  genid: (req: any) => {
    console.log('Inside the session middleware')
    console.log(req.sessionID)
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: config.auth.session_secret,
  resave: false,
  store: new FileStore(fileStoreOptions),
  saveUninitialized: true,
  });


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

const basicAuth = async function basicAuth(req: any, res: any, next: any) {
    
    console.log(req.sessionID);
    console.log(req.session);
    
    if(req.path == "/login" || req.path == "/auth/google/callback" || req.path == "/logout") {
	return next();
    }
    // header authentification via header for testing
    // @todo rewrite
    console.log(req.headers)
    if(!req.session.auth && !(req.header('Auth') == config.auth.client_secret)) {
	console.log('Not authorized');
	return res.redirect('/login');
    } 
    
    next();
}
const loginAction = async function (req: any, res:any) {
    if (req.session.auth) {

        res.render('login', {buttonSpan: 'Sign out', url: '/logout', userInfo: req.session.userEmail})
    } else {
        res.render('login', {buttonSpan: 'Sign in', url: redirectUrl, userInfo: ""})
    }
}

const callbackAction = async function (req: any, res:any) {
    const code = req.query.code;
    console.log(`Code is ${code}`);
    if (code) {
        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        req.session.auth = true;
        var oauth2 = google.oauth2({
	  auth: oauth2Client,
	  version: 'v2'
	});
	let userinfo = await oauth2.userinfo.get();
	let userEmail = userinfo.data.email;
	req.session.userEmail = userEmail;

    }
    res.redirect('/');
}

const logoutAction = (req: any, res: any) => {
    oauth2Client.revokeCredentials();
    req.session.auth = false;
    req.session.destroy();
    res.redirect('/login');
}

//============================================

export {
    sessionGen,
    basicAuth,
    loginAction,
    callbackAction,
    logoutAction
};