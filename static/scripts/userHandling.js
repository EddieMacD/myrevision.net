//Globals variables
///Stores user data throughout the running of the website
var userSession = {};

///Stores the user's data to do with their authentication and their access level
userSession.auth = {};

///The basic URL for the site
var baseURL = 'https://myrevision.net/';

///Where the login should take the user
var loginLocation = 'redirects/';

///Data required to access the authentication pipeline
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

///Importing the authentication library, built with the authentication data
var auth = new AmazonCognitoIdentity.CognitoAuth(authData);

///Success and fail for the authenticator
auth.userhandler = {
    onSuccess: function (result) {
        console.log('AUTH: SUCCESS');
    },
    onFailure: function (err) {
        console.log('AUTH: ERROR');
    }
};

//Handling user sign in
function signIn() {
    sessionStorage.removeItem("auth");
    auth.getSession();
} 

//Handling user sign out
function signOut() {
    sessionStorage.removeItem("auth");
    auth.signOut();
}

//If the user is running through localhost then change the authData and auth objects to reflect that
///Only for local testing. To REMOVE for public builds
function ifLocal() {
    //If Local
    ///If the current location includes localhost
    if(window.location.href.includes('http://localhost:1313/'))
    {
        ///Change data accordingly and reinitialise auth
        baseURL = 'http://localhost:1313/'
        authData.RedirectUriSignIn = baseURL + loginLocation;
        authData.RedirectUriSignOut = baseURL;

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
}

//Initalise a user's authentication status 
async function initialiseAuth() {
    //Variables
    ///The user's access token
    var accessToken = "";

    ///Remove any guest status from a user - to be added again later if necessary
    sessionStorage.removeItem("isGuest");

    ///Set local data if applicable
    ///REMOVE
    ifLocal();

    try {
        //Auth Cycle
        ///Parse the response from the cognito servers - this happens after the login page
        auth.parseCognitoWebResponse(window.location.href);

        ///If the user is signed in
        if (auth.isUserSignedIn()) {
            ///Get their access token
            accessToken = auth.getSignInUserSession().idToken.jwtToken;
        }

        ///If there is no local authorisation data - prevents unnecessary API calls
        if(!sessionStorage.getItem("auth"))
        {
            //If the user is signed in
            if (auth.isUserSignedIn()) {
                ///Get their username and access token - store them in the userSession.auth object
                userSession.auth.username = auth.getUsername();
                userSession.auth.accessToken = accessToken;

                ///Call the coldStartAPI
                await callColdStartAPI();

                ///Start the idler
                startIdler(0);

                ///Get userdata from the servers
                var userData = await getUserData(userSession.auth.username);

                ///Set the userdata to the userSession.auth object
                userSession.auth.email = userData.email;
                userSession.auth.accessLevel = userData.accessLevel;

                ///Make the user an active user
                userSession.auth.isUser = true;

                ///Set userSession.auth to the session storage for page changes
                sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
            } else {
                //If the user is a guest
                ///If the current page is not the home page
                if (window.location.href != baseURL && !window.location.href.includes("privacy-policy") && !window.location.href.includes("links"))
                {
                    ///Send them back to the home page
                    window.location.replace(baseURL);
                } else {
                    ///Reset userSession.auth to guest values
                    userSession.auth.username = "";
                    userSession.auth.accessToken = "";
                    userSession.auth.accessLevel = "guest";
                    userSession.auth.isUser = false;

                    ///Set the auth data to session storage
                    sessionStorage.setItem("auth", JSON.stringify(userSession.auth));
                }
            }

            ///Adapt the header bar
            adaptHeaderBar(userSession.auth.accessLevel);
        } else {
            ///If there is local auth data on the session storage

            //Variables
            ///Valid access levels
            const validAccess = ["student", "teacher", "admin"];

            ///Temporary idler value
            var tempTimer = 0;


            //Auth setup
            ///Parse the auth data from the session storage
            userSession.auth = JSON.parse(sessionStorage.getItem("auth"));

            ///Update the access token
            userSession.auth.accessToken = accessToken;
            
            ///Reset the session storage
            sessionStorage.setItem("auth", JSON.stringify(userSession.auth));

            ///If the user doesn't have a valid access level and are not on the home page
            if (!validAccess.includes(userSession.auth.accessLevel) && window.location.href != baseURL && !window.location.href.includes("privacy-policy") && !window.location.href.includes("links"))
            {
                ///Send them back to the home page
                window.location.replace(baseURL);
            }

            ///Parse the idler value from the session storage 
            tempTimer = parseInt(sessionStorage.getItem("idlerValue"));

            ///Update the idler by an iteration (since some time does pass each page change, and it may be a full iteration since last store)
            ///Manually set to prevent unnecessary global variables
            tempTimer += 250000;
            
            ///Start the idler
            startIdler(tempTimer);
        }

        //Hide the loader
        hideLoader();
    } catch(error) {
        adaptHeaderBar();
        generateErrorBar(error + " Please reload the page");
    }

    return userSession.isUser;
}

//Gets user data from the system
///username: the auto generated username for a user
async function getUserData(username) {
    //Data Retrieval
    ///The URI for the API to get the data, complete with requisite query string parameters
    var api = apiRoot + "/user/data?username=" + username;

    ///Calling the API for the data
    var userData = await callGetAPI(api, "user information");

    return userData;
}

//Adapt the header bar to the current user's access level
function adaptHeaderBar(status) {
    //Adapt Header Bar
    ///Switches based on access level and shows that level's header bar. Also shows/hides the profile and log out buttons
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

//A version of initialiseAuth for guest access
function doTestQuestions() {
    //Initialise
    ///Set guest access to the session storage
    sessionStorage.setItem("isGuest", "true");

    ///Send the user to the questions page
    window.location.replace(baseURL + "questions/");
}