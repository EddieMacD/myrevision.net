//Global constants
///The root for all of the API URIs used for the system
const apiRoot = "https://api.myrevision.net";

//A standard initialise function - runs unless a webpage's code has an override
function initialiseBasic() {
    //Initialisation
    ///A timeout - makes sure all of the libraries have loaded
    setTimeout(() => {
        ///Set the loader to 1 - on by default
        userSession.loaderVal = 1;

        ///Make sure the user is authorised
        initialiseAuth(); 
    }, 1);
}

//The standard procedure for calling a GET api
///api: the URI for the API that is being called, complete with query string parameters
///apiResults: what the API is retrieving/sending - to add context to the error messages
///isRetrieve: if the primary function of the API is retrieving data, or just sending it - false by default due to refactoring
async function callGetAPI(api, apiResults, isRetrieve = true) {
    //Variables
    ///A container for the data that the API call retrieves
    var data = {};

    ///A container for the whole error message, set depending on if data is primarily being retrieved or sent
    var errorMessage = "";

    if(isRetrieve) {
        errorMessage = "There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later.";
    } else {
        errorMessage = "There was an error changing " + apiResults + ". Please check your internet connection and try again later.";
    }


    //Get Data
    ///Show the loader
    showLoader();

    ///Get the data from the API
    data = await getAPIGetResult(api, errorMessage);

    ///Hide the loader
    hideLoader();

    return data;
}

//A function to get the results from a REST api with a GET method
///api: the api to get results from
async function getAPIGetResult(api, errorMessage) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery and ajax to call the API
        ///Due to the authorisor on the API the prebuilt quick calls in jquery don't work
        ///Takes in the URI, a success callback, a failure callback, a function to run before calling the API, the type of API and the content type
        ////DO NOT TOUCH
        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject(errorMessage + "<br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", userSession.auth.accessToken);
            },
            type: 'GET',
            contentType: 'json'
        });
    });
}

async function callPostAPI(api, postBody, apiResults, isRetrieve = true) {
    //Variables
    ///A container for the data that the API call retrieves
    var data = {};

    ///A container for the whole error message, set depending on if data is primarily being retrieved or sent
    var errorMessage = "";

    if(isRetrieve) {
        errorMessage = "There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later.";
    } else {
        errorMessage = "There was an error changing " + apiResults + ". Please check your internet connection and try again later.";
    }


    //Get Data
    ///Show the loader
    showLoader();

    ///Get the data from the API
    data = await getAPIPostResult(api, postBody, errorMessage);

    ///Hide the loader
    hideLoader();

    return data;
}

//A function to get the results from a REST api with a POST method
///api: the api to get results from
///postBody: the data to be posted
async function getAPIPostResult(api, postBody, errorMessage) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery and ajax to call the API
        ///Due to the authorisor on the API the prebuilt quick calls in jquery don't work
        ///Takes in the URI, a success callback, a failure callback, a function to run before calling the API, the type of API and the content type
        ////DO NOT TOUCH
        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject(errorMessage + " <br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", userSession.auth.accessToken);
            },
            data: JSON.stringify(postBody),
            type: 'POST',
            contentType: 'json'
        });
    });
}

//Runs the idler that keeps the backend alive whilst somebody has the website active
///Works by keeping a start time and an elapsed time. The time between the start time and the current time is added to the elapsed time, before the start time is set to the current time
///idlerValue: the start value for the idler - makes sure that it doesn't run every time a user changes page
function startIdler(idlerValue) {
    //Constants
    ///The time until the idler next pings the server
    const idlerLimit = 1740000;

    ///The iteration time for the idler
    const idlerIteration = 250000;


    //Priming the idler
    ///The current time
    userSession.idlerStart = Date.now();

    ///The amount of time currently elapsed for the idler
    userSession.idlerValue = idlerValue;

    ///Setting the idler value to session storage - allows for page reloads to run successfully
    sessionStorage.setItem("idlerValue", userSession.idlerValue);


    //Idler
    ///Sets an interval for the idler based on the idler iteration value. Set to userSession for easy stopping if necessary
    userSession.idler = setInterval(async () => {
        ///Add the elapsed time to the idler
        userSession.idlerValue += parseInt(Date.now() - userSession.idlerStart);

        ///Store the new elapsed time in the session storage
        sessionStorage.setItem("idlerValue", userSession.idlerValue);

        ///For testing
        //console.log(userSession.idlerValue);

        ///Set the new idler start time
        userSession.idlerStart = Date.now();

        ///If the idler value is greater than the idler limit
        if(userSession.idlerValue > idlerLimit) {
            ///Call the cold start api - keep the backend alive
            callColdStartAPI();

            ///Reset the idler
            userSession.idlerValue = 0;
        }
    }, idlerIteration);
}

//Ends the idler
function endIdler() {
    //End idler
    clearTimeout(userSession.idler());
}

//Calls the cold start API to make sure that the back end stays alive - a modification of the call get API method
async function callColdStartAPI () {
    try {
        //Variables
        ///The api to be called in order to ping the backend
        var api = apiRoot + "/cold-start";

        ///If the backend in online
        var isOnline = false;

        //Pinging Backend
        ///Show the loader screen
        showLoader();

        ///While the backend is offline
        do {
            ///Ping the server
            isOnline = await getAPIGetResult(api, "There was an error retrieving data from our servers. Please check your internet connection and try again later.");

            ///Wait a second
            await sleep(1000);

            ///If the backend is online
            if(isOnline){
                ///Hide the loader
                hideLoader();
            }

        } while (!isOnline);
    } catch (err) {
        generateErrorBar(err);
        hideLoader(true);
    }
}

//A custom sleep function - JavaScript has no inbuilt function 
///milliseconds: the amount of time (in milliseconds) to sleep for
async function sleep(milliseconds) {
    //Sleep
    ///Returns a promise, which contains a timeout which resolves after the amount of time previously 
    return new Promise((resolve) => setTimeout(resolve(true), milliseconds));
}

//Shows the loader screen
function showLoader() {
    //Show loader
    ///Increments the loader value - makes sure the loader is only hidden when all waiting methods cleared
    userSession.loaderVal++;

    ///If the loader is being shown for the first time
    if(userSession.loaderVal == 1)
    {
        ///Show the loader
        $("#loader-container").show();
        
        ///Clear the header bar
        adaptHeaderBar("");
    }
}

//Hide the loader screen
///isError: if there has been an error - automatically set to false unless overridden
function hideLoader(isError = false) {
    //Hide loader
    ///If there has been an error
    if (isError) {
        ///Set the loader value to 0 - overrride all loader values
        userSession.loaderVal = 0;
    } else if (userSession.loaderVal > 0) {
        ///If the loader value is not yet already zero decrease it by 1
        userSession.loaderVal--;
    }

    ///If the loader value is zero
    if(userSession.loaderVal == 0)
    {
        ///Hide the loader
        $("#loader-container").hide();
        
        ///Set the header bar to the appropriate level
        adaptHeaderBar(userSession.auth.accessLevel);
    }
}

