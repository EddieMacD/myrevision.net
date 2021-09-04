//Globals variables
///Stores user data throughout the running of the website
var userSession = {};
userSession.auth = {};

var baseURL = 'https://myrevision.net/';
var loginLocation = 'student-home/';

var authData = {
    ClientId: '19ulus5lk6h6aor1lknbm14dj8', // Your client id here
    AppWebDomain: 'auth.myrevision.net',
    TokenScopesArray: ['email', 'openid'], // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
    RedirectUriSignIn: baseURL + loginLocation,
    RedirectUriSignOut: baseURL,
    UserPoolId: 'eu-west-2_7lDI3aJAl', // Your user pool id here
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

    ifLocal();

    try {
        if(!sessionStorage.getItem("auth"))
        {
            auth.parseCognitoWebResponse(window.location.href);
            
            if (auth.isUserSignedIn()) {
                userSession.auth.username = auth.getUsername();
                userSession.auth.accessToken = auth.getSignInUserSession().idToken.jwtToken;

                await callColdStartAPI();
                startIdler(0);

                var userData = await getUserData(userSession.auth.username);
                userSession.auth.username = userData.email;
                userSession.auth.accessLevel = userData.accessLevel;
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
            var tempTimer = 0;

            userSession.auth = JSON.parse(sessionStorage.getItem("auth"));
            sessionStorage.setItem("auth", JSON.stringify(userSession.auth));

            tempTimer = parseInt(sessionStorage.getItem("idlerValue"));
            tempTimer += 60000;            
        }

        hideLoader();
    } catch(error) {
        adaptHeaderBar();
        generateErrorBar(error + " Please reload the page");
    }

    return userSession.isUser;
}

//TODO: automate
async function getUserData(username) {
    var api = apiRoot + "/database/user-data?username=" + username;

    var userData = await callGetAPI(api, "user information");

    return userData;
}

function adaptHeaderBar(status) {
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