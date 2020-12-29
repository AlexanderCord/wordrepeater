const {google} = require('googleapis');

const { OAuth2Client } = require("google-auth-library");




var config: any = require('../config'); 
//console.log(basicUsers);



// OAuth Authorization
// @todo use some external library to save auth session
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

const basicAuth = async function basicAuth(req: any, res: any, next: any) {
    if(req.path == "/login" || req.path == "/auth/google/callback" || req.path == "/logout") {
	return next();
    }
    // header authentification via header for testing
    // @todo rewrite
    console.log(req.headers)
    if(!auth && !(req.header('Auth') == config.auth.client_secret)) {
	console.log('Not authorized');
	return res.redirect('/login');
    } else if (auth) {
        var oauth2 = google.oauth2({
	  auth: oauth2Client,
	  version: 'v2'
	});
	let userinfo = await oauth2.userinfo.get();
	let userEmail = userinfo.data.email;
	req.app.locals.userEmail = userEmail;
    }
    
    next();
}
const loginAction = async function (req: any, res:any) {
    if (auth) {

        res.render('login', {buttonSpan: 'Sign out', url: '/logout', userInfo: req.app.locals.userEmail})
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
        auth = true;
    }
    res.redirect('/');
}

const logoutAction = (req: any, res: any) => {
    oauth2Client.revokeCredentials();
    auth = false;
    res.redirect('/login');
}

//============================================

export {
    basicAuth,
    loginAction,
    callbackAction,
    logoutAction
};