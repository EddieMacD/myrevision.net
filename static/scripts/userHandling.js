//Globals variables
///Stores user data throughout the running of the website
var userSession = {};
userSession.username = "";
userSession.accessToken = "";

var authData = {
    ClientId: '2dmv7immbp1e98elr1feph0g8r', // Your client id here
    AppWebDomain: 'auth.myrevision.net',
    TokenScopesArray: ['email', 'openid'], // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
    RedirectUriSignIn: 'https://myrevision.net',
    RedirectUriSignOut: 'https://myrevision.net',
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
    auth.getSession();
} 

function signOut() {
    console.log()
    auth.signOut();
}

function ifLocal() {
    if(window.location.href.includes('http://localhost:1313/'))
    {
        console.log("local");
        authData.RedirectUriSignIn = 'http://localhost:1313/';
        authData.RedirectUriSignOut = 'http://localhost:1313/';
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

function initialiseAuth() {
    console.log('initialiseAuth...');
    console.log('parsing: ' + window.location.href);

    try {
        setTimeout(() => {
            ifLocal();

            auth.parseCognitoWebResponse(window.location.href);
            
            if (auth.isUserSignedIn()) {
                userSession.username = auth.getUsername();
                console.log('AUTH: User is logged in: ' + userSession.username);

                userSession.accessToken = auth.getSignInUserSession().idToken.jwtToken;
                //console.log('Access token:' + userSession.accessToken);

                userSession.accessLevel = getAccessLevel();

                userSession.isUser = true;

            } else {
                //if(window.location.href != "https://myrevision.net/")
                //{
                    //window.location.replace("https://myrevision.net/");
                //} else {
                    console.log('AUTH: User is NOT logged in');

                    userSession.username = "";
                    userSession.accessToken = "";
                    userSession.accessLevel = "guest";
                    userSession.isUser = false;
                //}
            }

            adaptHeaderBar(userSession.accessLevel);
        }, 1);
    } catch(error) {
        adaptHeaderBar("guest");
        generateErrorBar(error.ToString() + "Please reload the page");
    }
}

//TODO: automate
function getAccessLevel() {
    return "teacher";
}

function adaptHeaderBar(status) {
    switch (status){
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

        default:
            $("#teacher-header").hide();
            $("#student-header").hide();
            $("#guest-header").show();

            $(".btn-log-in").show();
            $(".btn-profile").hide();
            break;  
    }
}