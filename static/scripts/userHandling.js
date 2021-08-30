//Globals variables
///Stores user data throughout the running of the website
var userSession = {};
userSession.auth = {};

var baseURL = 'https://myrevision.net/';
var loginLocation = '';

var authData = {
    ClientId: '2dmv7immbp1e98elr1feph0g8r', // Your client id here
    AppWebDomain: 'auth.myrevision.net',
    TokenScopesArray: ['email', 'openid'], // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
    RedirectUriSignIn: baseURL + loginLocation,
    RedirectUriSignOut: baseURL,
    UserPoolId: 'eu-west-2_p1xpG57TA', // Your user pool id here
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
    sessionStorage.removeItem("auth");
    auth.getSession();
} 

function signOut() {
    sessionStorage.removeItem("auth");
    auth.signOut();
}

function ifLocal() {
    if(window.location.href.includes('http://localhost:1313/'))
    {
        baseURL = 'http://localhost:1313/'
        authData.RedirectUriSignIn = baseURL + loginLocation;
        authData.RedirectUriSignOut = baseURL;
    }

    auth = new AmazonCognitoIdentity.CognitoAuth(authData);

    auth.userhandler = {
        onSuccess: function (result) {
            console.log('AUTH: SUCCESS');
        },
        onFailure: function (err) {
            console.log('AUTH: ERROR');
        }
    };
}

async function initialiseAuth() {
    console.log('initialiseAuth...');
    console.log('parsing: ' + window.location.href);

    try {
        if(!sessionStorage.getItem("auth"))
        {
            ifLocal();

            auth.parseCognitoWebResponse(window.location.href);
            
            if (auth.isUserSignedIn()) {
                userSession.auth.username = auth.getUsername();
                userSession.auth.accessToken = auth.getSignInUserSession().idToken.jwtToken;

                await callColdStartAPI();
                startIdler(0);

                userSession.auth.accessLevel = await getAccessLevel(userSession.auth.username);
                userSession.auth.isUser = true;

                sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
            } else {
                if(window.location.href != baseURL)
                {
                    window.location.replace(baseURL);
                } else {
                    userSession.auth.username = "";
                    userSession.auth.accessToken = "";
                    userSession.auth.accessLevel = "guest";
                    userSession.auth.isUser = false;

                    sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
                }
            }

            adaptHeaderBar(userSession.auth.accessLevel);
        } else {
            console.log("session storage")
            userSession.auth = JSON.parse(sessionStorage.getItem("auth"));
            sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
            //startIdler(sessionStorage.getItem("idlerValue"));
        }
    } catch(error) {
        adaptHeaderBar("guest");
        generateErrorBar(error + " Please reload the page");
    }

    return userSession.isUser;
}

//TODO: automate
async function getAccessLevel(username) {
    var api = apiRoot + "/database/access-level?email=" + username;

    var accessLevel = await callGetAPI(api, "user information");
    accessLevel = accessLevel.accessLevel;

    return accessLevel;
}

function adaptHeaderBar(status) {
    console.log("adapt header: " + status);

    switch (status){
        case "admin":
            $("#teacher-header").show();
            $("#student-header").hide();
            $("#guest-header").hide();

            $(".btn-log-in").hide();
            $(".btn-profile").show();
            break;

        case "teacher":
            $("#teacher-header").show();
            $("#student-header").hide();
            $("#guest-header").hide();

            $(".btn-log-in").hide();
            $(".btn-profile").show();
            break;

        case "student":
            $("#teacher-header").hide();
            $("#student-header").show();
            $("#guest-header").hide();

            $(".btn-log-in").hide();
            $(".btn-profile").show();
            break;

        case "guest":
            $("#teacher-header").hide();
            $("#student-header").hide();
            $("#guest-header").show();

            $(".btn-log-in").show();
            $(".btn-profile").hide();
            break;  

        default :
            $("#teacher-header").hide();
            $("#student-header").hide();
            $("#guest-header").hide();

            $(".btn-log-in").hide();
            $(".btn-profile").hide();
            break;  
    }
}