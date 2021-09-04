const apiRoot = "https://api.myrevision.net";

function initialiseBasic() {
    setTimeout(() => {
        userSession.loaderVal = 1;
        initialiseAuth(); 
    }, 1);
}

async function callGetAPI(api, apiResults) {
    var data = {};

    showLoader();

    data = await getAPIGetResult(api, apiResults);

    hideLoader();

    return data;
}

//A function to get the results from a REST api with a GET method
///api: the api to get results from
async function getAPIGetResult(api, apiResults) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        /*
        ///Uses jquery to easily call the api, takes in the APi and a callback function
        $.get(api, html => {
            //resolve returns the data passed into it to the promise, which sends it to the 
            resolve(html);
        }).fail((error) => {
            ///The fail function rejects the promise, throwing an exception with the inputted text. The error is used to create a neat error meddage to post to the try catch 
            reject("There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later. <br> Error code " + error.status + " --- " + error.responseText);
        });
        */

        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject("There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later. <br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
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
    var data = {};
    var errorMessage = "";

    if(isRetrieve) {
        errorMessage = "There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later.";
    } else {
        errorMessage = "There was an error creating " + apiResults + ". Please check your internet connection and try again later.";
    }

    showLoader();

    data = await getAPIPostResult(api, postBody, errorMessage);

    hideLoader();

    return data;
}

//A function to get the results from a REST api with a POST method
///api: the api to get results from
///postBody: the data to be posted
async function getAPIPostResult(api, postBody, apiResults) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, passes in the API, the post body, a callback function and the format of the post body

        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject(apiResults + " <br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
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

function startIdler(idlerValue) {
    const idlerLimit = 250000;
    const idlerIteration = 50000;

    userSession.idlerStart = Date.now();
    userSession.idlerValue = idlerValue;

    userSession.idler = setInterval(() => {
        userSession.idlerValue += parseInt(Date.now() - userSession.idlerStart);
        sessionStorage.setItem("idlerValue", userSession.idlerValue);
        console.log(userSession.idlerValue);

        userSession.idlerStart = Date.now();

        if(userSession.idlerValue > idlerLimit) {
            callColdStartAPI();
            userSession.idlerValue = 0;
        }
    }, idlerIteration);
}

function endIdler() {
    clearTimeout(userSession.idler());
}

async function callColdStartAPI () {
    try {
        var api = apiRoot + "/database/cold-start";
        var isDBOnline = false;

        showLoader();

        do {
            isDBOnline = await getAPIGetResult(api, "data");

            await sleep(1000);

            if(isDBOnline){
                hideLoader();
            }

        } while (!isDBOnline);
    } catch (err) {
        generateErrorBar(err);
    }
}

async function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve(true), milliseconds));
}

function showLoader() {
    userSession.loaderVal++;

    if(userSession.loaderVal == 1)
    {
        $("#loader-container").show();
        adaptHeaderBar("");
    }
}

function hideLoader() {
    userSession.loaderVal--;

    if(userSession.loaderVal == 0)
    {
        $("#loader-container").hide();
        adaptHeaderBar(userSession.auth.accessLevel);
    }
}

