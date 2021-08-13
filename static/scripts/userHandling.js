//Globals variables
///Stores user data throughout the running of the website
var userSession = {};
userSession.username = "";
userSession.accessToken = "";

var authData = {
    ClientId: '6d63k0a2hssi7sk12nelv5oviu', // Your client id here
    AppWebDomain: 'auth.myrevision.net',
    TokenScopesArray: ['email', 'openid'], // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
    RedirectUriSignIn: 'https://myrevision.net',
    RedirectUriSignOut: 'https://myrevision.net',
    UserPoolId: 'eu-west-2_DsMj5ZLwa', // Your user pool id here
    AdvancedSecurityDataCollectionFlag: 'false' //, // e.g. true
    //Storage: new CookieStorage() // OPTIONAL e.g. new CookieStorage(), to use the specified storage provided
};

var auth = new AmazonCognitoIdentity.CognitoAuth(authData);

auth.userhandler = {
    onSuccess: function (result) {
        console.log('AUTH: SUCCESS');
    },
    onFailure: function (err) {
        console.log('AUTH: ERROR');
    }
};

function signIn() {
    auth.getSession();
} 

function signOut() {
    auth.signOut();
}

function initialiseAuth() {
    console.log('initialiseAuth...');
    console.log('parsing: ' + window.location.href);
    try {
        setTimeout(() => {
            auth.parseCognitoWebResponse(window.location.href);

            if (auth.isUserSignedIn()) {
                userSession.username = auth.getUsername();
                console.log('AUTH: User is logged in: ' + userSession.username);

                userSession.accessToken = auth.getSignInUserSession().idToken.jwtToken;
                console.log('Access token:' + userSession.accessToken);

                userSession.isUser = true;


                $("#itm-log-in").hide();
                $("#itm-profile").show();
            } else {
                console.log('AUTH: User is NOT logged in');

                userSession.username = "";
                userSession.accessToken = "";
                userSession.isUser = false;

                $("#itm-log-in").show();
                //$("#itm-profile").hide();
            }
        }, 1);
    } catch(error) {
        generateErrorBar(error);
    }
}